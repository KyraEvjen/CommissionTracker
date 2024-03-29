//Commission Base
let commissionId = document.getElementById('commission-id');
let commissions = document.getElementById('commissions');

//Text Inputs from User (TextBoxes)
let titleInput = document.getElementById('title');
let descInput = document.getElementById('desc');
let titleEditInput = document.getElementById('title-edit');
let descEditInput = document.getElementById('desc-edit');

//Date Input
let dateStarted;
let dateEdit;

//Commission Status from User (Dropdown Box Selection)
let statusChoice; //The Text Status
let barPercent; //The width of the progress Bar
let barColor; //The color of the progress bar

let statusEdit;
let percentEdit;
let colorEdit;

//Data/API
let data = [];
let selectedCommission = {};
const api = 'http://localhost:8000';

function tryAdd() {
  let msg = document.getElementById('msg');
  msg.innerHTML = '';
}

//Listen for Date Selection
document.getElementById('myDate').addEventListener('change', function(event) {
  dateStarted = event.target.value;
});

//Listen for Date Selection - Edit/Update Modal
document.getElementById('myDateUpdate').addEventListener('change', function(event) {
  dateEdit = event.target.value;
});

// Listen for User Selection for Commission Status
document.querySelector('[aria-labelledby="dropdownAdd"]').addEventListener('click', (e) => {
  //Add Commission: Modal Version
  if (e.target.classList.contains('dropdown-item') && e.target.getAttribute('key') === '1') {
    statusChoice = e.target.innerText; 

    let value = e.target.getAttribute('value');

  const progressBarWidths = {
    1: "15", 
    2: "25", 
    3: "50",
    4: "75",
    5: "100"    
  };

  const colorMap = {
    1: "red",
    2: "yellow",
    3: "teal",
    4: "blue",
    5: "green"
  };

  barPercent = progressBarWidths[value];
  barColor = colorMap[value];
}
});

//Add Commission: Form-Add
document.getElementById('form-add').addEventListener('submit', (e) => {
  e.preventDefault();

  if (!titleInput.value) {
    document.getElementById('msg').innerHTML = 'Commission title cannot be blank';
  }
  else if(statusChoice === undefined)
  {
    document.getElementById('msg').innerHTML = 'Commission status cannot be blank';
  }
   else {
    if (dateStarted === undefined || dateStarted === '')
    {
      dateStarted = "N/A, Payment Recieved";
    }
    addCommission(titleInput.value, descInput.value, statusChoice, barPercent, barColor, dateStarted);
    //Close Modal
    let add = document.getElementById('add');
    add.setAttribute('data-bs-dismiss', 'modal');
    add.click();
    (() => {
      add.setAttribute('data-bs-dismiss', '');
    })();
    
    //Reset the Text and Progress Bar
    document.getElementById('dropdownAdd').innerHTML = "Select a status";
    const myBar = document.getElementById("myBar")
    myBar.style.width = 0;
    myBar.style.backgroundColor = "gray";
    const dateInput = document.getElementById('myDate');
    dateInput.value = '';
    dateStarted = undefined;
  }
});

//Add Commission 
let addCommission = (title, description, status, width, color, date) => {
  
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 201) {
      const newCommission = JSON.parse(xhr.responseText);
      data.push(newCommission);
      refreshCommissions();
    }
  };
  xhr.open('POST', `${api}/commissions`, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify({ title, description, status , width, color, date}));
};

//Refresh Commissions
let refreshCommissions = () => {
  commissions.innerHTML = '';
  data
    .sort((a, b) => b.id - a.id)
    .map((x) => {
      return (commissions.innerHTML += `
        <div id="commission-${x.id}">
          <span class="fw-bold fs-4">${x.title}</span>
          <pre class="text-secondary ps-12">${x.description}</pre>
          <span class = "fs-6">Date Started: ${x.date}</span>
          <span class="fw-bold fs-5.2">${x.status}</span>

          <div id="myProgress">
          <span id="myBarStored" style = "width: ${x.width}%; background-color: ${x.color};" ></div>
        </span>
  
          <span class="options">
            <i onClick="tryEditCommission(${x.id})" data-bs-toggle="modal" data-bs-target="#modal-edit" class="fas fa-edit"></i>
            <i onClick="deleteCommission(${x.id})" class="fas fa-trash-alt"></i>
          </span>
        </div>
    `);
    });

  resetForm();
};

//Try Edit Commission
let tryEditCommission = (id) => {
  const commission = data.find((x) => x.id === id);
  selectedCommission = commission;
  commissionId.innerText = commission.id;
  titleEditInput.value = commission.title;
  descEditInput.value = commission.description;
  statusEdit = commission.status;
  percentEdit = commission.width;
  colorEdit = commission.color;
  dateEdit= commission.date;
  document.getElementById('msg').innerHTML = '';
};

//Update Modal Dropdown
document.querySelector('[aria-labelledby="dropdownEdit"]').addEventListener('click', (e) => {
if (e.target.classList.contains('dropdown-item') && e.target.getAttribute('key') === '2') {
  statusEdit = e.target.innerText; 

  let value = e.target.getAttribute('value');

const progressBarWidths = {
    1: "15", 
    2: "25", 
    3: "50",
    4: "75",
    5: "100"  
};

const colorMap = {
  1: "red",
  2: "yellow",
  3: "teal",
  4: "blue",
  5: "green"
};

percentEdit = progressBarWidths[value];
colorEdit = colorMap[value];
}
});

//Form Update/Edit Submit
document.getElementById('form-edit').addEventListener('submit', (e) => {
  e.preventDefault();

  if (!titleEditInput.value) {
    msg.innerHTML = 'Commission cannot be blank';
  } else {
    editCommission(titleEditInput.value, descEditInput.value, statusEdit, percentEdit, colorEdit, dateEdit);

    //Close Modal
    let edit = document.getElementById('edit');
    edit.setAttribute('data-bs-dismiss', 'modal');
    edit.click();
    (() => {
      edit.setAttribute('data-bs-dismiss', '');
    })();

    //Reset Commission Status Selection
    document.getElementById('dropdownAdd').innerHTML = "Select a status";
    const myBar = document.getElementById("myBar")
    myBar.style.width = 0;
    myBar.style.backgroundColor = "gray";
  }
});


let editCommission = (title, description, status, width, color, date) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      selectedCommission.title = title;
      selectedCommission.description = description;
      selectedCommission.status = status;
      selectedCommission.width = width;
      selectedCommission.color = color;
      selectedCommission.date = date;
      refreshCommissions();
    }
  };
  xhr.open('PUT', `${api}/commissions/${selectedCommission.id}`, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify({ title, description, status, width, color, date }));
};

let deleteCommission = (id) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      data = data.filter((x) => x.id !== id);
      refreshCommissions();
    }
  };
  xhr.open('DELETE', `${api}/commissions/${id}`, true);
  xhr.send();
};

let resetForm = () => {
  titleInput.value = '';
  descInput.value = '';
  statusChoice = undefined;
  barPercent = '0';
  barColor = 'gray'
};

let getCommissions = () => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      data = JSON.parse(xhr.responseText) || [];
      refreshCommissions();
    }
  };
  xhr.open('GET', `${api}/commissions`, true);
  xhr.send();
};

(() => {
  getCommissions();
})();

//Add Modal Functions
function updateText(option) {
  const dropdownButton = document.getElementById("dropdownAdd");

  const optionChoice = {
    A: 'Paid / Starting', 
    B: 'Sketch Completed', 
    C: 'Lineart Completed',  
    D: 'Coloring Completed', 
    E: 'Completed', 
  };

  dropdownButton.innerText = optionChoice[option];
  updateProgressBar(option);
}


function updateProgressBar(option) {
  const myBar = document.getElementById("myBar");
  const progressBarWidths = {
      A: "15%", 
      B: "25%", 
      C: "50%",
      D: "75%",
      E: "100%"  
  };

  // Set the width and color based on the selected option
  myBar.style.width = progressBarWidths[option];
  myBar.style.backgroundColor = getBackgroundColor(option);
}

function getBackgroundColor(option) {
  // Define color mappings based on options (you can customize this)
  const colorMap = {
      A: "red",
      B: "yellow",
      C: "teal",
      D: "blue",
      E: "green"
  };

  return colorMap[option] || "gray"; // Default to gray if option not found
}


//Edit Modal Functions
function updateTextEdit(option) {
  const dropdownButton = document.getElementById("dropdownEdit");

  const optionChoice = {
    A: 'Paid / Starting', 
    B: 'Sketch Completed', 
    C: 'Lineart Completed',  
    D: 'Coloring Completed', 
    E: 'Completed', 
  };

  dropdownButton.innerText = optionChoice[option];
  updateProgressBar2(option);
}

//Progress Bar in Edit/Update Modal
function updateProgressBar2(option) {
  const myBar = document.getElementById("myBarEdit");
  const progressBarWidths = {
    A: "15%", 
    B: "25%", 
    C: "50%",
    D: "75%",
    E: "100%"  
};

  // Set the width and color based on the selected option
  myBar.style.width = progressBarWidths[option];
  myBar.style.backgroundColor = getBackgroundColor(option);
}

function getBackgroundColor(option) {
  // Define color mappings based on options (you can customize this)
  const colorMap = {
      A: "red",
      B: "yellow",
      C: "teal",
      D: "blue",
      E: "green"
  };

  return colorMap[option] || "gray"; // Default to gray if option not found
}