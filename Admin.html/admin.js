// ...existing code...
// Remove any <script> ... </script> tags from this file. Put only JavaScript here.
// Below is your JS content (no <script> wrappers):
// ---------- CONFIG ----------
// Replace these endpoints with your backend's endpoints
const API = {
  login: '/api/login',
  logout: '/api/logout',
  companies: '/api/companies',
  ipos: '/api/ipos',
  investors: '/api/investors',
  applications: '/api/applications',
  transactions: '/api/transactions'
};

// Simple in-memory demo auth flag (replace with real auth)
let AUTH = { user: null, token: null };

// ---------- UTILITIES ----------
function showSection(id){
  document.querySelectorAll('main section').forEach(s => s.style.display = 'none');
  const el = document.getElementById(id);
  if(el) el.style.display = 'block';
  // mark nav
  document.querySelectorAll('.nav-item').forEach(n=> n.classList.remove('active'));
  document.querySelector(`.nav-item[href="#${id}"]`)?.classList.add('active');
  if(id === 'dashboard') loadDashboard();
  if(id === 'companies') loadCompanies();
  if(id === 'ipos') loadIPOs();
  if(id === 'applications') loadApplications();
  if(id === 'transactions') loadTransactions();
}

function openModal(id){
  document.getElementById(id).classList.add('active');
}
function closeModal(id){
  document.getElementById(id).classList.remove('active');
}

function setUser(email){
  AUTH.user = email;
  document.getElementById('user-email').textContent = email;
  // hide login modal
  document.getElementById('modal-login').classList.remove('active');
  // show dashboard by default
  showSection('dashboard');
}

// ---------- DEMO LOGIN ----------
function demoLogin(){
  // demo credentials
  setUser('admin@example.com');
  // populate data in background
  loadAllForDemo();
}

async function login(){
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  // TODO: call API: replace demo behaviour with real fetch to API.login
  // Example:
  // const res = await fetch(API.login, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password})});
  // handle token etc
  setUser(email || 'admin@example.com');
  loadAllForDemo();
}

function logout(){
  AUTH = { user:null, token:null };
  document.getElementById('modal-login').classList.add('active');
  // clear UI
  document.getElementById('kpi-investors').textContent = '0';
  document.getElementById('kpi-ipos').textContent = '0';
  document.getElementById('kpi-apps').textContent = '0';
}

// ---------- DEMO DATA (client-side fallback) ----------
let DEMO = {
  companies: [],
  ipos: [],
  investors: [],
  applications: [],
  transactions: []
};

function loadAllForDemo(){
  // create 10 companies
  DEMO.companies = [
    {CompanyID:1, CompanyName:'Groww', Sector:'Broking', CEO:'Ravi Kumar', Headquarters:'Bengaluru'},
    {CompanyID:2, CompanyName:'Lenskart', Sector:'', CEO:'Meera Iyer', Headquarters:'Hyderabad'},
    {CompanyID:3, CompanyName:'Tata Power', Sector:'Energy', CEO:'Suresh Patel', Headquarters:'Mumbai'},
    {CompanyID:4, CompanyName:'ITC', Sector:'FMCG', CEO:'Anita Rao', Headquarters:'Chennai'},
    {CompanyID:5, CompanyName:'HDFC Bank', Sector:'Fi nance', CEO:'Vikram Singh', Headquarters:'New Delhi'},
    {CompanyID:6, CompanyName:'Tata Motors', Sector:'Automobile', CEO:'Arjun Desai', Headquarters:'Pune'},
    {CompanyID:7, CompanyName:'Reliance', Sector:'Retail', CEO:'Priya Sharma', Headquarters:'Kolkata'},
    {CompanyID:8, CompanyName:'zee', Sector:'Media', CEO:'Karan Verma', Headquarters:'Noida'},
    {CompanyID:9, CompanyName:'Airtel', Sector:'Telecom', CEO:'Ramesh Gupta', Headquarters:'Gurgaon'},
    {CompanyID:10, CompanyName:'Kalapataru', Sector:'Construction', CEO:'Leela Nair', Headquarters:'Ahmedabad'}
  ];
  DEMO.ipos = DEMO.companies.map((c,i)=>({
    IPOID:i+1, CompanyID:c.CompanyID, CompanyName:c.CompanyName, IssueDate:'2024-09-0'+((i%9)+1),
    PricePerShare: 100 + i*7, TotalShares:100000 + i*5000, Status: i%2===0 ? 'OPEN' : 'CLOSED'
  }));
  DEMO.investors = Array.from({length:10}).map((_,i)=>({
    InvestorID:i+1, Name:`Investor ${i+1}`, Email:`investor${i+1}@ex.com`, PAN:`PAN${i+1}`
  }));
  DEMO.applications = Array.from({length:10}).map((_,i)=>({
    ApplicationID:i+1, IPOID:(i%10)+1, InvestorID:((i*3)%10)+1, SharesApplied:10 + i*2, ApplicationDate:'2024-10-0'+((i%9)+1), Status: i%2 ? 'RECEIVED' : 'PROCESSED'
  }));
  DEMO.transactions = Array.from({length:10}).map((_,i)=>({
    TransactionID:i+1, InvestorID:((i*2)%10)+1, Amount:1000 + i*200, TransactionDate:'2024-10-1'+((i%9)+1), PaymentMethod: i%2? 'NETBANKING':'UPI', Status: 'SUCCESS'
  }));

  // refresh UI
  loadDashboard();
  loadCompanies();
  loadIPOs();
  loadApplications();
  loadTransactions();
}

// ---------- DASHBOARD ----------
let chartInstance = null;
function loadDashboard(){
  // KPI counts
  const inv = DEMO.investors.length;
  const ipos = DEMO.ipos.filter(i=>i.Status==='OPEN').length;
  const apps = DEMO.applications.filter(a=>a.Status==='RECEIVED').length;
  document.getElementById('kpi-investors').textContent = inv;
  document.getElementById('kpi-ipos').textContent = ipos;
  document.getElementById('kpi-apps').textContent = apps;

  // Chart - IPO Price
  const ctx = document.getElementById('chart-ipoprice').getContext('2d');
  const labels = DEMO.ipos.map(i=>i.IPOID + ' - ' + i.CompanyName);
  const data = DEMO.ipos.map(i=>i.PricePerShare);
  if(chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type:'bar',
    data:{labels, datasets:[{label:'Price/Share', data}]},
    options:{responsive:true, maintainAspectRatio:false}
  });
}

function refreshDashboard(){
  // In real app: fetch latest summary from backend
  loadDashboard();
}

// ---------- COMPANIES CRUD ----------
function loadCompanies(){
  const tbody = document.querySelector('#table-companies tbody');
  tbody.innerHTML = '';
  DEMO.companies.forEach(c=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.CompanyID}</td>
                    <td>${c.CompanyName}</td>
                    <td>${c.Sector}</td>
                    <td>${c.CEO}</td>
                    <td>${c.Headquarters}</td>
                    <td>
                      <button class="btn ghost" onclick="editCompany(${c.CompanyID})">Edit</button>
                      <button class="btn danger" onclick="deleteCompany(${c.CompanyID})">Delete</button>
                    </td>`;
    tbody.appendChild(tr);
  });
}

function openCompanyModal(){
  document.getElementById('company-modal-title').textContent = 'Add Company';
  document.getElementById('company-name').value='';
  document.getElementById('company-sector').value='';
  document.getElementById('company-ceo').value='';
  document.getElementById('company-hq').value='';
  openModal('modal-company');
  document.getElementById('modal-company').dataset.editId = '';
}

function editCompany(id){
  const c = DEMO.companies.find(x=>x.CompanyID===id);
  if(!c) return alert('Company not found');
  document.getElementById('company-modal-title').textContent = 'Edit Company';
  document.getElementById('company-name').value = c.CompanyName;
  document.getElementById('company-sector').value = c.Sector;
  document.getElementById('company-ceo').value = c.CEO;
  document.getElementById('company-hq').value = c.Headquarters;
  openModal('modal-company');
  document.getElementById('modal-company').dataset.editId = id;
}

function saveCompany(){
  const id = document.getElementById('modal-company').dataset.editId;
  const name = document.getElementById('company-name').value.trim();
  const sector = document.getElementById('company-sector').value.trim();
  const ceo = document.getElementById('company-ceo').value.trim();
  const hq = document.getElementById('company-hq').value.trim();
  if(!name) return alert('Name required');
  if(id){
    // update demo
    const c = DEMO.companies.find(x=>x.CompanyID==id);
    c.CompanyName = name; c.Sector = sector; c.CEO = ceo; c.Headquarters = hq;
    // TODO: PUT /api/companies/:id
  } else {
    // create demo
    const newId = (DEMO.companies.length ? Math.max(...DEMO.companies.map(x=>x.CompanyID)) : 0) + 1;
    DEMO.companies.push({CompanyID:newId, CompanyName:name, Sector:sector, CEO:ceo, Headquarters:hq});
    // TODO: POST /api/companies
  }
  closeModal('modal-company');
  loadCompanies();
  loadIPOs(); // refresh joins
  loadDashboard();
}

function deleteCompany(id){
  if(!confirm('Delete this company?')) return;
  DEMO.companies = DEMO.companies.filter(x=>x.CompanyID!==id);
  // TODO: DELETE /api/companies/:id
  loadCompanies();
  loadIPOs();
  loadDashboard();
}

// ---------- IPOs ----------
function loadIPOs(){
  const tbody = document.querySelector('#table-ipos tbody');
  tbody.innerHTML = '';
  DEMO.ipos.forEach(i=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i.IPOID}</td>
                    <td>${i.CompanyName}</td>
                    <td>${i.IssueDate || ''}</td>
                    <td>${i.PricePerShare}</td>
                    <td>${i.TotalShares}</td>
                    <td>${i.Status}</td>
                    <td>
                      <button class="btn ghost" onclick="viewIPO(${i.IPOID})">View</button>
                    </td>`;
    tbody.appendChild(tr);
  });
}

function viewIPO(id){
  const i = DEMO.ipos.find(x=>x.IPOID===id);
  alert(`IPO ${id} — ${i.CompanyName}\nPrice: ${i.PricePerShare}\nStatus: ${i.Status}`);
}

function openIPOForm(){
  const companyList = DEMO.companies.map(c=>`${c.CompanyID}:${c.CompanyName}`).join('\n');
  const cid = parseInt(prompt('Enter company ID to create IPO (choose from list)\n' + companyList));
  if(!cid || isNaN(cid)) return;
  const nextId = (DEMO.ipos.length ? Math.max(...DEMO.ipos.map(x=>x.IPOID)) : 0) + 1;
  const company = DEMO.companies.find(c=>c.CompanyID===cid);
  if(!company) return alert('Company not found');
  DEMO.ipos.push({IPOID:nextId, CompanyID:cid, CompanyName:company.CompanyName, IssueDate:new Date().toISOString().split('T')[0], PricePerShare:150, TotalShares:100000, Status:'OPEN'});
  loadIPOs(); loadDashboard();
  // TODO: POST /api/ipos
}

// ---------- APPLICATIONS ----------
function loadApplications(){
  const tbody = document.querySelector('#table-applications tbody');
  tbody.innerHTML = '';
  DEMO.applications.forEach(a=>{
    const ipo = DEMO.ipos.find(i=>i.IPOID===a.IPOID) || {};
    const inv = DEMO.investors.find(u=>u.InvestorID===a.InvestorID) || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.ApplicationID}</td>
                    <td>${ipo.CompanyName || a.IPOID}</td>
                    <td>${inv.Name || a.InvestorID}</td>
                    <td>${a.SharesApplied}</td>
                    <td>${a.ApplicationDate}</td>
                    <td>${a.Status}</td>
                    <td>
                      <button class="btn ghost" onclick="viewApplication(${a.ApplicationID})">View</button>
                    </td>`;
    tbody.appendChild(tr);
  });
  const selIpo = document.getElementById('app-ipo');
  const selInvestor = document.getElementById('app-investor');
  selIpo.innerHTML = DEMO.ipos.map(i=>`<option value="${i.IPOID}">${i.CompanyName} (IPO ${i.IPOID})</option>`).join('');
  selInvestor.innerHTML = DEMO.investors.map(u=>`<option value="${u.InvestorID}">${u.Name}</option>`).join('');
}

function openApplicationModal(){
  document.getElementById('app-shares').value = 10;
  document.getElementById('app-date').value = new Date().toISOString().split('T')[0];
  openModal('modal-application');
}

function saveApplication(){
  const ipoid = parseInt(document.getElementById('app-ipo').value);
  const investorid = parseInt(document.getElementById('app-investor').value);
  const shares = parseInt(document.getElementById('app-shares').value);
  const date = document.getElementById('app-date').value;
  const newId = (DEMO.applications.length ? Math.max(...DEMO.applications.map(x=>x.ApplicationID)) : 0) + 1;
  DEMO.applications.push({ApplicationID:newId, IPOID:ipoid, InvestorID:investorid, SharesApplied:shares, ApplicationDate:date, Status:'RECEIVED'});
  closeModal('modal-application');
  loadApplications();
  loadDashboard();
  // TODO: POST /api/applications
}

function viewApplication(id){
  const a = DEMO.applications.find(x=>x.ApplicationID===id);
  alert(JSON.stringify(a,null,2));
}

// ---------- TRANSACTIONS ----------
function loadTransactions(){
  const tbody = document.querySelector('#table-transactions tbody');
  tbody.innerHTML = '';
  DEMO.transactions.forEach(t=>{
    const inv = DEMO.investors.find(u=>u.InvestorID===t.InvestorID) || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t.TransactionID}</td>
                    <td>${inv.Name || t.InvestorID}</td>
                    <td>${t.Amount}</td>
                    <td>${t.TransactionDate}</td>
                    <td>${t.PaymentMethod}</td>
                    <td>${t.Status}</td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('trx-investor').innerHTML = DEMO.investors.map(u=>`<option value="${u.InvestorID}">${u.Name}</option>`).join('');
  document.getElementById('trx-date').value = new Date().toISOString().split('T')[0];
}

function openTransactionModal(){ openModal('modal-transaction'); }

function saveTransaction(){
  const inv = parseInt(document.getElementById('trx-investor').value);
  const amount = parseFloat(document.getElementById('trx-amount').value);
  const method = document.getElementById('trx-method').value;
  const date = document.getElementById('trx-date').value;
  if(!amount || amount<=0) return alert('Enter valid amount');
  const newId = (DEMO.transactions.length ? Math.max(...DEMO.transactions.map(x=>x.TransactionID)) : 0) + 1;
  DEMO.transactions.push({TransactionID:newId, InvestorID:inv, Amount:amount, TransactionDate:date, PaymentMethod:method, Status:'SUCCESS'});
  closeModal('modal-transaction');
  loadTransactions();
  // TODO: POST /api/transactions
}

// ---------- GLOBAL SEARCH ----------
function globalSearch(e){
  const q = e.target.value.toLowerCase().trim();
  const tbody = document.querySelector('#table-companies tbody');
  tbody.innerHTML = '';
  DEMO.companies.filter(c=> (c.CompanyName||'').toLowerCase().includes(q) || (c.Sector||'').toLowerCase().includes(q)).forEach(c=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.CompanyID}</td><td>${c.CompanyName}</td><td>${c.Sector}</td><td>${c.CEO}</td><td>${c.Headquarters}</td><td><button class="btn ghost" onclick="editCompany(${c.CompanyID})">Edit</button></td>`;
    tbody.appendChild(tr);
  });
}

// ---------- Initialization ----------
(function init(){
  // keep login modal open initially; for demo auto-fill
  // Optionally auto demo login:
  // demoLogin();
})();
// ...existing code...