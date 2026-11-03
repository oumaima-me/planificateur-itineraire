function BudgetSummary({ budgetTotal, depenses }) {
  const budgetRestant = budgetTotal - depenses;

  return (
    <div className="budget-summary">
      <h3>Résumé du budget</h3>

      <p>Budget total : {budgetTotal} DH</p>
      <p>Dépenses prévues : {depenses} DH</p>
      <p>Budget restant : {budgetRestant} DH</p>

      <small>Les montants sont des estimations.</small>
    </div>
  );
}

export default BudgetSummary;