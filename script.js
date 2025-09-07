const API_URL = "http://localhost:3000";

// 🟢 Fetch and display transactions based on selected date range & type
let transactions = []; // Declare globally so it's accessible everywhere

async function fetchTransactions(filter = false) {
    const startDate = document.getElementById("startdate").value;
    const endDate = document.getElementById("enddate").value;
    const transactionType = document.getElementById("transactionFilter").value;
    const productName = document.getElementById("productFilter").value.trim();
    const sortOrder = document.getElementById("sortOrder").value;

    let url = `${API_URL}/transactions`;

    if (filter) {
        url = `${API_URL}/transactions/filter?type=${transactionType}`;
        if (startDate && endDate) {
            url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        if (productName) {
            url += `&product=${productName}`;
        }
    }

    // ✅ Corrected the way we append `sort` parameter
    url += filter ? `&sort=${sortOrder}` : `?sort=${sortOrder}`;

    try {
        console.log("Fetching transactions from:", url); // ✅ Debugging log
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch transactions");

        const transactions = await response.json();
        updateTransactionTable(transactions);
        fetchTotals(); // ✅ Fetch total sales & purchases after loading transactions

        document.getElementById("transactionTableContainer").style.display = "block"; // ✅ Show table
    } catch (error) {
        console.error("❌ Error fetching transactions:", error);
        alert("⚠️ Failed to load transactions.");
    }
}



async function fetchTotals() {
    try {
        const response = await fetch(`${API_URL}/transactions/totals`);
        if (!response.ok) throw new Error("Failed to fetch totals");

        const data = await response.json();
        document.getElementById("totalSales").innerText = `$${data.totalSales.toFixed(2)}`;
        document.getElementById("totalPurchases").innerText = `$${data.totalPurchases.toFixed(2)}`;
        
        document.getElementById("totalsContainer").style.display = "flex"; // ✅ Show totals box
    } catch (error) {
        console.error("Error fetching total sales & purchases:", error);
    }
}

// 🟢 Update the transaction table in HTML
function updateTransactionTable(transactions) {
  console.log("Updating table with transactions:", transactions);

  const tableBody = document.getElementById("transactionTable");

  if (!tableBody) {
    console.error("❌ Table body with id='transactionTable' not found!");
    return;
  }

  tableBody.innerHTML = "";

  transactions.forEach((transaction, index) => {
    console.log(`🔄 Row ${index + 1}:`, transaction);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${transaction.product || transaction.name || "—"}</td>
      <td>${transaction.quantity || 0}</td>
      <td>${new Date(transaction.date || transaction.createdAt || Date.now()).toLocaleDateString()}</td>
      <td>${transaction.type || "manual"}</td>
      <td>$${transaction.price ? transaction.price.toFixed(2) : "0.00"}</td>
      <td><input type="checkbox" class="delete-checkbox" data-id="${transaction._id}"></td>
    `;

    tableBody.appendChild(row);
  });
}





async function deleteSelectedTransactions() {
    const selectedCheckboxes = document.querySelectorAll(".delete-checkbox:checked");
    
    if (selectedCheckboxes.length === 0) {
        alert("⚠️ Please select at least one transaction to delete.");
        return;
    }

    const transactionIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute("data-id"));

    if (!confirm(`Are you sure you want to delete ${transactionIds.length} transaction(s)?`)) return;

    try {
        const response = await fetch(`${API_URL}/transactions/delete-multiple`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: transactionIds })
        });

        if (!response.ok) throw new Error("Failed to delete transactions.");

        alert("✅ Selected transactions deleted successfully!");
        fetchTransactions(); // Refresh transaction list
    } catch (error) {
        console.error("❌ Error deleting transactions:", error);
        alert("⚠️ Failed to delete transactions.");
    }
}



// 🟢 Add a new transaction
async function addTransaction() {
    const product = document.getElementById("transactionProduct").value;
    const quantity = parseInt(document.getElementById("transactionQuantity").value);
    const date = document.getElementById("transactionDate").value;
    const type = document.getElementById("transactionType").value;
    const price = parseFloat(document.getElementById("transactionPrice").value);

    if (!product || !quantity || !date || !price) {
        alert("All fields are required.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product, quantity, date, type, price })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`⚠️ Error: ${data.error}`);
        } else {
            alert("✅ Transaction added successfully!");
            fetchTransactions(); // Refresh transactions table
        }
    } catch (error) {
        console.error("Error adding transaction:", error);
        alert("⚠️ Failed to add transaction.");
    }
}


// 🟢 Check product availability
async function checkProductAvailability() {
    const product = document.getElementById("product").value.trim();  // ✅ Ensure correct input field is used
    if (!product) {
        alert("⚠️ Please enter a product name.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/product-availability?product=${encodeURIComponent(product)}`);
        if (!response.ok) throw new Error("Failed to fetch product availability.");

        const data = await response.json();

        // ✅ Display stock availability
        let message = `✅ Available Stock: ${data.availableStock}`;
        if (data.availableStock < 5) {
            message = `⚠️ LOW STOCK ALERT: Only ${data.availableStock} left for ${data.product}!`;
            alert(message);  // ✅ Show pop-up alert if stock is low
        }

        document.getElementById("stockInfo").innerText = message;  // ✅ Display in the UI as well

    } catch (error) {
        console.error("❌ Error checking product availability:", error);
        alert("⚠️ Failed to check stock.");
    }
}






// 🟢 Attach event listeners to buttons
document.getElementById("loadTransactions").addEventListener("click", () => {
    fetchTransactions(false); // ✅ Load all transactions

    // ✅ Show the totals box
    document.getElementById("totalsContainer").style.display = "flex";
});

document.getElementById("filterTransactions").addEventListener("click", () => {
    fetchTransactions(true); // ✅ Load filtered transactions

    // ✅ Show the totals box
    document.getElementById("totalsContainer").style.display = "flex";
});
document.getElementById("deleteSelected").addEventListener("click", deleteSelectedTransactions);
document.getElementById("addTransaction").addEventListener("click", addTransaction);
document.getElementById("extractStock").addEventListener("click", checkProductAvailability);
document.getElementById("resetFilters").addEventListener("click", () => {
    // ✅ Clear all filter inputs
    document.getElementById("startdate").value = "";
    document.getElementById("enddate").value = "";
    document.getElementById("transactionFilter").value = "all";
    document.getElementById("productFilter").value = "";
    document.getElementById("sortOrder").value = "newest";

    // ✅ Hide the transactions table
    document.getElementById("transactionTableContainer").style.display = "none";

    // ✅ Hide total sales and purchases
    document.getElementById("totalsContainer").style.display = "none";

    console.log("Filters reset, table hidden."); // ✅ Debugging log
});
function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  document.getElementById("voice-output").textContent = "Listening... 🎙️";

  recognition.start();

 recognition.onresult = function(event) {
  const transcript = event.results[0][0].transcript.toLowerCase();
  document.getElementById("voice-output").textContent = `✅ You said: "${transcript}"`;
  console.log("Raw command:", transcript); // 👈 Add this line
  processVoiceCommand(transcript);
};


  recognition.onerror = function (event) {
    document.getElementById("voice-output").textContent = 'Error occurred: ' + event.error;
  };
}

function processVoiceCommand(command) {
  console.log("🗣 Raw voice command:", command);
  command = command.trim().toLowerCase();

  // Fix common speech-to-text errors
  const wordToNum = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
    fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
    twenty: 20, thirty: 30, forty: 40, fifty: 50
  };

  const regex = /(add|sell)\s+(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+([\w\s]+?)\s+(for|at|of)\s+(one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty|\d+)/;
  const match = command.match(regex);

  if (!match) {
    alert("❌ Command not recognized. Try saying: 'Sell 3 sugar for 30'");
    speak("Command not recognized");
    return;
  }

  const action = match[1];
  let quantity = match[2];
  let product = match[3].trim();
  let price = match[5];

  // Convert words to numbers
  quantity = isNaN(quantity) ? wordToNum[quantity] : parseInt(quantity);
  price = isNaN(price) ? wordToNum[price] : parseInt(price);

  if (product.endsWith("s")) product = product.slice(0, -1); // normalize plurals

  const type = action === "add" ? "purchase" : "sale";
  const totalPrice = quantity * price;

  console.log(`📦 ${type.toUpperCase()} ${quantity} ${product} @ ₹${price} = ₹${totalPrice}`);

  fetch("http://localhost:3000/addItem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product,
      quantity,
      price: totalPrice,
      type,
      date: new Date()
    })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        const msg = `✅ ${type === "purchase" ? "Added" : "Sold"} ${quantity} ${product} for ₹${totalPrice}`;
        alert(msg);
        speak(msg);
        fetchAndUpdateTransactions?.();
      } else {
        alert(`❌ ${data.message}`);
        speak(data.message);
      }
    })
    .catch((err) => {
      alert(`❌ Error: ${err.message}`);
      speak("Something went wrong");
    });
}




function wordPriceToNumber(text) {
  const words = text.toLowerCase().split(/[\s-]+/);
  const small = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
    fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19
  };
  const tens = {
    twenty: 20, thirty: 30, forty: 40, fifty: 50,
    sixty: 60, seventy: 70, eighty: 80, ninety: 90
  };

  let result = 0, temp = 0;
  for (const word of words) {
    if (small[word] !== undefined) temp += small[word];
    else if (tens[word]) temp += tens[word];
    else if (word === "hundred") temp *= 100;
    else if (!isNaN(parseInt(word))) temp += parseInt(word);
  }
  return result + temp;
}
function cleanVoiceText(text) {
  return text
    .toLowerCase()
    .replace(/\bcell\b/g, "sell")
    .replace(/\bto\b/g, "2")
    .replace(/\btoo\b/g, "2")
    .replace(/\btwo\b/g, "2")
    .replace(/\bmilks\b/g, "milk")
    .replace(/\bsugars\b/g, "sugar")
    .replace(/\boils\b/g, "oil")
    .replace(/\bones\b/g, "1")
    .replace(/\bthree\b/g, "3")
    .replace(/\bfour\b/g, "4")
    .replace(/\bfive\b/g, "5")
    .replace(/\bsix\b/g, "6")
    .replace(/\bseven\b/g, "7")
    .replace(/\beight\b/g, "8")
    .replace(/\bnine\b/g, "9")
    .replace(/\bten\b/g, "10");
}

function speak(msg) {
  const utter = new SpeechSynthesisUtterance(msg);
  window.speechSynthesis.speak(utter);
}












function searchItemByName(item) {
  // Example search logic (customize based on your existing code)
  const allRows = document.querySelectorAll("table tr");
  for (let i = 1; i < allRows.length; i++) {
    const nameCell = allRows[i].cells[0];
    if (nameCell && nameCell.textContent.toLowerCase().includes(item)) {
      allRows[i].style.backgroundColor = "lightyellow";
    } else {
      allRows[i].style.backgroundColor = "";
    }
  }
}
function fetchAndUpdateTransactions() {
  fetch("http://localhost:3000/transactions?sort=newest")
    .then(res => res.json())
    .then(data => updateTransactionTable(data))
    .catch(err => console.error("❌ Error fetching transactions:", err));
}


















