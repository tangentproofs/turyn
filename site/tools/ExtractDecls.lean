/-
  Dump every hand-written declaration of the Turyn Lean library (modules Turyn.*,
  plus Results) as JSON: name, kind, module, source range, and the project-local
  constants used by its type (statement) and by its value (proof / body).

  Usage (from lean/, after `lake build` and `lake build Results`):
    lake env lean ../site/tools/ExtractDecls.lean   # writes ../site/data/decls.raw.json
  Set TURYN_DECLS_OUT to write elsewhere.

  Challenge.lean is not imported: it restates the two `Turyn.Result.*` theorems with
  `sorry` (it is comparator's challenge template), and Results.lean proves the same names.
-/
import Turyn
import Results
open Lean Meta

def isProjModule (env : Environment) (n : Name) : Option Name := do
  let idx ← env.getModuleIdxFor? n
  let m := env.header.moduleNames[idx.toNat]!
  if (`Turyn).isPrefixOf m || m == `Results then some m else none

def kindOf : ConstantInfo → String
  | .axiomInfo _ => "axiom" | .defnInfo _ => "def" | .thmInfo _ => "theorem"
  | .opaqueInfo _ => "opaque" | .quotInfo _ => "quot" | .inductInfo _ => "inductive"
  | .ctorInfo _ => "constructor" | .recInfo _ => "recursor"

/-- Generated helper constants we fold into their parent. -/
def isGenerated (env : Environment) (n : Name) : Bool :=
  n.isInternalDetail || isAuxRecursor env n || isNoConfusion env n ||
  (match n with
   | .str _ s => s.startsWith "match_" || s.startsWith "proof_" || s.startsWith "eq_" ||
       s == "eq_def" || s == "injEq" || s == "inj" || s == "sizeOf_spec" || s == "ctorIdx" ||
       s == "noConfusionType" || s.startsWith "_" || s == "rec" || s == "ext_iff" ||
       s.startsWith "ctorElim" || s == "elim"
   | _ => false) ||
  (env.find? n |>.map (fun c => c matches .recInfo _ | .ctorInfo _) |>.getD false) ||
  -- structure field projections (`Rect.x₀`, `Hypermap.edge`) are folded into the structure
  env.isProjectionFn n

/-- Map a generated constant to the user-facing declaration it belongs to. -/
partial def canon (env : Environment) (n : Name) : Name :=
  if !isGenerated env n then n
  else match env.find? n with
    | some (.ctorInfo c) => c.induct
    | some (.recInfo _) => canon env n.getPrefix
    | _ => if n.getPrefix.isAnonymous then n else canon env n.getPrefix

def jsonStrs (xs : Array Name) : Json := Json.arr (xs.map (fun n => Json.str n.toString))

def extract : CoreM Json := do
  let env ← getEnv
  let mut rows : Array Json := #[]
  -- Only walk the project's own modules: iterating `env.constants` would page in every
  -- Mathlib constant (`Turyn.Equivalence` imports all of Mathlib).
  let mut projNames : Array Name := #[]
  for i in [0:env.header.moduleNames.size] do
    let m := env.header.moduleNames[i]!
    if (`Turyn).isPrefixOf m || m == `Results then
      projNames := projNames ++ env.header.moduleData[i]!.constNames
  for n in projNames do
    let some ci := env.find? n | continue
    let some m := isProjModule env n | continue
    if isGenerated env n then continue
    let some rng ← findDeclarationRanges? n | continue
    -- Constants that never get a row of their own — generated auxiliaries such as
    -- `gsDataOfTSequence.proof_1` / `match_1` / equation lemmas, and `private` lemmas — are
    -- looked *through*: the project constants THEY use are credited to the declaration that
    -- uses them. (Without this, e.g. the `gsDataOfTSequence → tseqCombine_periodic_identity`
    -- edge, which lives inside an auto-generated `proof_1`, was lost.)
    -- Returns (direct, viaProof): `viaProof` are the constants reached only through a
    -- generated/private *theorem* (e.g. a `proof_1` abstracted out of a def body). Those are
    -- proof dependencies even when the outer declaration is a def.
    let collect (e : Expr) : Array Name × Array Name := Id.run do
      let mut acc : Std.HashSet Name := {}
      let mut accP : Std.HashSet Name := {}
      let mut seen : Std.HashSet (Name × Bool) := {}
      let mut todo : Array (Name × Bool) := e.getUsedConstants.map (·, false)
      let mut fuel := 100000
      while todo.size > 0 do
        if fuel == 0 then break
        fuel := fuel - 1
        let (c, inProof) := todo.back!
        todo := todo.pop
        if seen.contains (c, inProof) then continue
        seen := seen.insert (c, inProof)
        if (isProjModule env c).isNone then continue
        let transparent := isGenerated env c || isPrivateName c
        if transparent then
          match env.find? c with
          | some ci' =>
            let p := inProof || (match ci' with | .thmInfo _ => true | _ => false)
            todo := todo ++ ci'.type.getUsedConstants.map (·, p)
            match ci'.value? (allowOpaque := true) with
            | some v => todo := todo ++ v.getUsedConstants.map (·, p)
            | none => pure ()
          | none => pure ()
        let c' := canon env c
        if c' != n && (isProjModule env c').isSome && !isPrivateName c' && !isGenerated env c' then
          if inProof then accP := accP.insert c' else acc := acc.insert c'
      let srt (h : Std.HashSet Name) := h.toArray.qsort (·.toString < ·.toString)
      return (srt acc, srt (accP.filter (!acc.contains ·)))
    let ext (e : Expr) : Array Name := Id.run do
      let mut acc : Std.HashSet Name := {}
      for c in e.getUsedConstants do
        let c' := canon env c
        if (isProjModule env c').isNone && !c'.isInternalDetail then acc := acc.insert c'
      return acc.toArray.qsort (·.toString < ·.toString)
    let (tyDeps, tyProof) := collect ci.type
    let (valDeps, valProof) := match ci.value? (allowOpaque := true) with
      | some v => collect v | none => (#[], #[])
    let (ctorDeps, ctorProof) : Array Name × Array Name := match ci with
      | .inductInfo i => i.ctors.foldl (fun (acc, accP) c =>
          match env.find? c with
          | some cc => let (d, p) := collect cc.type; (acc ++ d, accP ++ p)
          | none => (acc, accP)) (#[], #[])
      | _ => (#[], #[])
    let isInst := (Meta.instanceExtension.getState env).instanceNames.contains n
    rows := rows.push <| Json.mkObj [
      ("name", Json.str n.toString),
      ("kind", Json.str (if isInst then "instance" else kindOf ci)),
      ("module", Json.str m.toString),
      ("line", Json.num rng.range.pos.line),
      ("endLine", Json.num rng.range.endPos.line),
      ("typeDeps", jsonStrs ((tyDeps ++ ctorDeps).toList.eraseDups.toArray.filter (· != n))),
      ("valueDeps", jsonStrs valDeps),
      ("proofOnlyDeps", jsonStrs ((tyProof ++ valProof ++ ctorProof).toList.eraseDups.toArray.filter (· != n))),
      ("mathlib", jsonStrs (ext ci.type))]
  return Json.arr rows

#eval show CoreM Unit from do
  let out ← extract
  let path := (← IO.getEnv "TURYN_DECLS_OUT").getD "../site/data/decls.raw.json"
  IO.FS.writeFile path out.compress
