    function submitForm() {
      const ipo = document.getElementById('ipo').value;
      const searchType = document.querySelector('input[name="searchType"]:checked').value;
      const pan = document.getElementById('pan').value.trim();

      if (!ipo || !pan) {
        alert("Please select IPO and enter required details.");
        return;
      }

      // Example API call (replace with your Flask or Node backend route)
      // fetch('/api/allotment', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ipo, searchType, pan}) })
      //   .then(res => res.json())
      //   .then(data => console.log(data));

      alert(`Searching allotment for IPO: ${ipo}\nSearch Type: ${searchType}\nPAN: ${pan}`);
    }
