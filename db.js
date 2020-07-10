const { response } = require("express");

// Variables
let db;
const request = window.indexedDB.open("budgetIndexedDB", 1);

// On Unpgrade Needed for storing object
request.onupgradeneeded = ({ target }) => {
    db = target.result;
    const objStore = db.createObjectStore("budget", { autoIncrement: true });
    // objStore.createIndex("transaction", "transaction");
}

// On Success (Could possibly remove)
request.onsuccess = event => {
    db = event.target.result;
    if(navigator.onLine) {
        checkDatabase;
    }
};

// Checking the database
checkDatabase = () => {
    const transaction = db.transaction(["budget"], "readwrite");
    const store = transaction.objStore("budget");
    var getTransactions = store.getAll();
    getTransactions.onsuccess = function() {
        if(getTransactions.result.length > 0) {
            fetch("api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getTransactions.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    // Clearing database reaching online
                    const transaction = db.transaction(["budget"], "readwrite");
                    const store = transaction.objStore("budget");
                    store.clear();
                    console.log("IndexedDB cleared.");
                })
        }
    }
};

// On Error
request.onerror = function (event) {
    console.log("Failed to run IndexedDB. Error: ", event.target.errorCode);
};

// Saving new transaction
saveRecord = newTransaction => {
    const transaction = db.transaction(["budget"], "readwrite");
    const store = transaction.objStore("budget");
    store.add(newTransaction);
}

// Listening to the app coming back online
window.addEventListener("online", checkDatabase);