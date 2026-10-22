/- Axiom audit for the informalization site (Trust page).
   From lean/:  lake env lean ../site/tools/Axioms.lean -/
import Turyn
import Results
open Turyn
#print axioms Turyn.Result.tt_implies_hadamard
#print axioms Turyn.Result.xy_interior_antipalindrome
#print axioms hadamard_428_exists
#print axioms kharaghani_2005_tt36
#print axioms tt6_valid
#print axioms tt6_hadamard_isHadamard
#print axioms tt6_energy
#print axioms tt6_sums
#print axioms kh05_energy
#print axioms kh05_sums
#print axioms kh05_hadamard_order
#print axioms Turyn.ofIsTurynTypeMatrix_isHadamard
#print axioms Turyn.turynToHadamardMatrix_isHadamard
#print axioms Turyn.typedGsMatrix_isHadamard
#print axioms step2_periodic
#print axioms energy_identity
#print axioms turyn_vanishing_total
#print axioms weightedTotalAutocorr_decompose
#print axioms sum_sq_eq_len_add_two_totalAutocorr
#print axioms Turyn.canonical_representative_exists
#print axioms Turyn.xy_product_law
#print axioms Turyn.xy_product_eq_neg_one
