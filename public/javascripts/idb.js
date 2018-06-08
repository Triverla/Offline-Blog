
// This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

// Open (or create) the database
var open = indexedDB.open("craniumdb", 1);

// Create the schema
open.onupgradeneeded = function() {
    var db = open.result;
    var store = db.createObjectStore("users", {keyPath: "id"});
    var index = store.createIndex("Name", ["name.last", "name.first"]);
};

open.onsuccess = function() {
    // Start a new transaction
    var db = open.result;
    var tx = db.transaction("users", "readwrite");
    var store = tx.objectStore("users");
    var index = store.index("Name");

    // Add some data
    store.put({id: 01, name: {first: "Benaiah", last: "Yusuf"}, age: 25});
    store.put({id: 02, name: {first: "Sky", last: "Roberts"}, age: 29});
    
    // Query the data
    var getBenaiah = store.get(01);
    var getSky = index.get(["Roberts", "Sky"]);

    getBenaiah.onsuccess = function() {
        console.log(getBenaiah.result.name.first);  
    };

    getSky.onsuccess = function() {
        console.log(getSky.result.name.first);  
    };

    // Close the db when the transaction is done
    tx.oncomplete = function() {
        db.close();
    };
}