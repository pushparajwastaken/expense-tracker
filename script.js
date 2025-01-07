document.addEventListener("DOMContentLoaded", () => {
  const expenseform = document.getElementById("expense-form");
  const expensenameinput = document.getElementById("expense-name");
  const expenseamountinput = document.getElementById("amount");
  const addexpensebtn = document.getElementById("add-expense");
  const expenseListdisplay = document.getElementById("expense-list");
  const total = document.getElementById("total");
  const totalamountdisplay = document.getElementById("total-amount");
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let totalamount = calculatetotal();
  renderexpense();
  function saveexpense() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }
  function calculatetotal() {
    return expenses.reduce(
      (acc, expenses) => acc + parseFloat(expenses.amount),
      0
    );
  }
  expenseform.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = expensenameinput.value.trim();
    const amount = parseFloat(expenseamountinput.value.trim());
    //this will give us the input in a string format but we don't want it
    //so we have to manuallly convert the amount to a number
    //console.log(typeof amount);
    if (name !== "" && !isNaN(amount) && amount > 0) {
      const newexpense = {
        id: Date.now(),
        name,
        amount, //this means amount:amount
      };
      expenses.push(newexpense);
      saveexpense();
      renderexpense();
      updatetotal();

      //clear input
      expensenameinput.value = "";
      expenseamountinput.value = "";
    }
  });
  function updatetotal() {
    totalamount = calculatetotal();
    totalamountdisplay.textContent = totalamount.toFixed(2);
  }
  function renderexpense() {
    expenseListdisplay.innerHTML = "";
    expenses.forEach((expense) => {
      const li = document.createElement("li");
      li.innerHTML = `
      ${expense.name}-$${expense.amount}
      <button data-id="${expense.id}">Delete</button>
      `;
      expenseListdisplay.appendChild(li);
    });
  }
  expenseListdisplay.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const expenseId = parseInt(e.target.getAttribute("data-id"));
      expenses = expenses.filter((expense) => expense.id !== expenseId);
      saveexpense();
      renderexpense();
      updatetotal();
    }
  });
});
