let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
      console.log("App is Online and Running");
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Error " + event.target.errorCode);
};

function saveRecord(record) {
    console.log("Your currently Offline, but The record is Saved:" + record);
  //creating a transaction with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");

  // create an access to your pending object store
  const store = transaction.objectStore("pending");
  store.add(record);
}

function checkDatabase() {
  // check a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const store = transaction.objectStore("pending");
  // create a variable and get all records from store 
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        console.log("transaction successfully saved from offline");
        const transaction = db.transaction(["pending"], "readwrite");

        const store = transaction.objectStore("pending");
        store.clear();
      });
    }
  };
}

window.addEventListener("online", checkDatabase);