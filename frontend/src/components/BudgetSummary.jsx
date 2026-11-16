function BudgetSummary({ budgetTotal, depenses }) {
  const budgetRestant = budgetTotal - depenses;
  const estEnDepassement = depenses > budgetTotal;

  return (
    <div className={`budget-summary ${estEnDepassement ? "depassement-alerte" : ""}`}>
      <h3>Résumé du budget</h3>

      <p>Budget total : {budgetTotal} DH</p>
      <p>Dépenses prévues : {depenses} DH</p>
      <p>Budget restant : {budgetRestant} DH</p>

      {estEnDepassement && (
        <div className="alert-danger" style={{ color: "red", fontWeight: "bold", marginTop: "8px" }}>
          ⚠️ Alerte : Vous avez dépassé votre budget initial !
        </div>
      )}

      <small>Les montants sont des estimations basées sur vos étapes.</small>
    </div>
  );
}

export default BudgetSummary;