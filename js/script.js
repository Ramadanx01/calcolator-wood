// Global variables for number pad
let activeInput = null;
let numberPadVisible = false;

function addRow() {
  const lengthRows = document.querySelectorAll('.length-row');
  const row = document.createElement('div');
  row.className = 'length-row';
  row.innerHTML = `
    <input type="number" class="length" min="0" max="600" placeholder="الطول (سم)" required oninput="checkLengthWarnings(); updateTotalQuantity()" inputmode="none" />
    ${lengthRows.length === 0 ? `
      <input type="number" class="count" min="0" placeholder="العدد" required oninput="updateTotalQuantity()" inputmode="none" />
      <button onclick="decreaseLength(this)">-30 سم</button>
      <button onclick="increaseLength(this)">+30 سم</button>
    ` : `
      <input type="text" class="prev-length" readonly placeholder="الطول السابق" />
      <input type="number" class="count" min="0" placeholder="العدد" required oninput="updateTotalQuantity()" inputmode="none" />
      <button onclick="increaseLength(this)">+30 سم</button>
    `}
    <button onclick="removeRow(this.parentNode)">حذف</button>
  `;
  document.getElementById('lengths').appendChild(row);
  updatePrevLengths();
  updateTotalQuantity();
  setupInputListeners();
}

function decreaseLength(button) {
  const input = button.parentNode.querySelector('.length');
  const value = parseInt(input.value || 0) - 30;
  input.value = Math.max(0, value);
  updatePrevLengths();
  checkLengthWarnings();
  updateTotalQuantity();
}

function increaseLength(button) {
  const input = button.parentNode.querySelector('.length');
  const value = parseInt(input.value || 0) + 30;
  input.value = Math.min(600, value);
  updatePrevLengths();
  checkLengthWarnings();
  updateTotalQuantity();
}

function removeRow(row) {
  row.remove();
  updatePrevLengths();
  checkLengthWarnings();
  updateTotalQuantity();
}

function updatePrevLengths() {
  const lengthRows = document.querySelectorAll('.length-row');
  const lengths = Array.from(lengthRows).map(row => parseFloat(row.querySelector('.length').value) || 0);
  lengthRows.forEach((row, index) => {
    if (index > 0) {
      const prevLengthInput = row.querySelector('.prev-length');
      if (lengths[index - 1] <= 0) {
        prevLengthInput.value = 'لا يوجد';
      } else {
        prevLengthInput.value = `${lengths[index - 1] - 30} سم`;
      }
    }
  });
}

function checkLengthWarnings() {
  const lengths = document.querySelectorAll('.length');
  const warningDiv = document.getElementById('warning');
  let hasWarning = false;

  clearTimeout(checkLengthWarnings.timeout);
  warningDiv.innerHTML = '';
  warningDiv.style.display = 'none';

  lengths.forEach((input, index) => {
    const length = parseFloat(input.value) || 0;
    if (length > 600) {
      hasWarning = true;
      warningDiv.innerHTML += `<p>الطول (${length} سم) في السطر ${index + 1} يجب ألا يزيد عن 600 سم. <span class="close-warning" style="cursor: pointer; color: #fff; padding: 0 5px; float: left;">X</span></p>`;
    }
  });

  if (hasWarning) {
    warningDiv.style.display = 'block';
    const closeButtons = warningDiv.getElementsByClassName('close-warning');
    for (let button of closeButtons) {
      button.onclick = () => {
        warningDiv.style.display = 'none';
        clearTimeout(checkLengthWarnings.timeout);
      };
    }
    checkLengthWarnings.timeout = setTimeout(() => {
      warningDiv.style.display = 'none';
    }, 3000);
  }
  
  // Update summary whenever length warnings are checked
  updateSummary();
}

function calculate() {
  const thicknessMM = parseFloat(document.getElementById('thickness').value) || 0;
  const thicknessCM = thicknessMM / 10;
  const width = parseFloat(document.getElementById('width').value) || 0;
  const lengths = document.querySelectorAll('.length');
  const counts = document.querySelectorAll('.count');
  const warningDiv = document.getElementById('warning');

  if (thicknessCM <= 0 || width <= 0 || lengths.length === 0) {
    warningDiv.innerHTML = '<p>يرجى إدخال التخانة والعرض والطول والعدد بشكل صحيح. <span class="close-warning">X</span></p>';
    warningDiv.style.display = 'block';
    const closeButton = warningDiv.querySelector('.close-warning');
    if (closeButton) {
      closeButton.onclick = () => {
        warningDiv.style.display = 'none';
      };
    }
    return;
  }

  let totalVolumeCM = 0;
  for (let i = 0; i < lengths.length; i++) {
    const length = parseFloat(lengths[i].value) || 0;
    const count = parseInt(counts[i].value) || 0;
    totalVolumeCM += thicknessCM * width * length * count;
  }

  const volumeM = totalVolumeCM / 1000000;
  const volumeMFormatted = volumeM.toFixed(4); // **أربع أرقام بعد العلامة**

  const pricePerM3 = parseFloat(document.getElementById('pricePerM3').value) || 0;
  const totalPrice = pricePerM3 > 0 ? (volumeM * pricePerM3).toFixed(2) : 'غير محدد';

  document.getElementById('volumeCM').innerText = totalVolumeCM.toFixed(0);
  document.getElementById('volumeM').innerText = volumeMFormatted;
  document.getElementById('totalPrice').innerText = totalPrice;
  
  // Add success animation to results
  const resultsDiv = document.querySelector('.results');
  resultsDiv.classList.add('success-animation');
  setTimeout(() => {
    resultsDiv.classList.remove('success-animation');
  }, 500);
}

function clearCalculation() {
  document.getElementById('thickness').value = '';
  document.getElementById('width').value = '';
  document.getElementById('pricePerM3').value = '';
  document.getElementById('lengths').innerHTML = `
    <div class="length-row">
      <input type="number" class="length" min="0" max="600" placeholder="الطول (سم)" required oninput="checkLengthWarnings(); updateTotalQuantity()" inputmode="none" />
      <input type="number" class="count" min="0" placeholder="العدد" required oninput="updateTotalQuantity()" inputmode="none" />
      <button onclick="decreaseLength(this)">-30 سم</button>
      <button onclick="increaseLength(this)">+30 سم</button>
      <button onclick="removeRow(this.parentNode)">حذف</button>
    </div>
  `;
  document.getElementById('volumeCM').innerText = '0';
  document.getElementById('volumeM').innerText = '0.0000';
  document.getElementById('totalPrice').innerText = 'غير محدد';
  document.getElementById('summary').innerHTML = '';
  document.getElementById('totalQuantity').innerHTML = '';
  
  // Setup input listeners for the new row
  setupInputListeners();
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  const themeButton = document.querySelector('.theme-toggle');
  themeButton.innerHTML = isDark ? '🌙' : '☀️';
}

// New function to update the summary display
function updateSummary() {
  const thicknessMM = parseFloat(document.getElementById('thickness').value) || 0;
  const width = parseFloat(document.getElementById('width').value) || 0;
  const summaryDiv = document.getElementById('summary');
  
  if (thicknessMM > 0 && width > 0) {
    summaryDiv.innerHTML = `التخانة: ${thicknessMM} مم, العرض: ${width} سم`;
    summaryDiv.style.display = 'block';
  } else {
    summaryDiv.innerHTML = '';
    summaryDiv.style.display = 'none';
  }
}

// New function to calculate and update total quantity of wood pieces
function updateTotalQuantity() {
  const counts = document.querySelectorAll('.count');
  let totalCount = 0;
  
  counts.forEach(input => {
    totalCount += parseInt(input.value) || 0;
  });
  
  const totalQuantityDiv = document.getElementById('totalQuantity');
  if (totalCount > 0) {
    totalQuantityDiv.innerHTML = `مجموع قطع الخشب: ${totalCount}`;
    totalQuantityDiv.style.display = 'block';
  } else {
    totalQuantityDiv.innerHTML = '';
    totalQuantityDiv.style.display = 'none';
  }
}

// Setup custom number pad functionality
function setupNumberPad() {
  const numberPadToggle = document.getElementById('numberPadToggle');
  const numberPadContainer = document.getElementById('numberPadContainer');
  const numButtons = document.querySelectorAll('.num-btn');
  const clearBtn = document.querySelector('.clear-btn');
  const enterBtn = document.querySelector('.enter-btn');
  
  // Toggle number pad visibility
  numberPadToggle.addEventListener('click', () => {
    numberPadVisible = !numberPadVisible;
    if (numberPadVisible) {
      numberPadContainer.classList.add('active');
    } else {
      numberPadContainer.classList.remove('active');
    }
  });
  
  // Handle number buttons click
  numButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (activeInput) {
        const digit = btn.getAttribute('data-value');
        activeInput.value = (activeInput.value || '') + digit;
        
        // Trigger the appropriate events based on the input type
        const event = new Event('input', { bubbles: true });
        activeInput.dispatchEvent(event);
      }
    });
  });
  
  // Handle clear button click
  clearBtn.addEventListener('click', () => {
    if (activeInput) {
      activeInput.value = '';
      
      // Trigger the appropriate events
      const event = new Event('input', { bubbles: true });
      activeInput.dispatchEvent(event);
    }
  });
  
  // Handle enter button click
  enterBtn.addEventListener('click', () => {
    if (activeInput) {
      activeInput.blur();
      activeInput = null;
      numberPadContainer.classList.remove('active');
      numberPadVisible = false;
    }
  });
  
  setupInputListeners();
}

// Setup input field listeners for the number pad
function setupInputListeners() {
  const allInputs = document.querySelectorAll('input[type="number"]');
  
  allInputs.forEach(input => {
    // Remove existing event listeners if any
    input.removeEventListener('focus', inputFocusHandler);
    
    // Add new event listener
    input.addEventListener('focus', inputFocusHandler);
  });
}

function inputFocusHandler(e) {
  activeInput = e.target;
  
  if (numberPadVisible) {
    document.getElementById('numberPadContainer').classList.add('active');
  }
  
  // Prevent default keyboard on mobile
  activeInput.addEventListener('click', function(e) {
    if (numberPadVisible) {
      e.preventDefault();
      this.blur();
      this.focus();
    }
  });
}

window.onload = function () {
  updatePrevLengths();
  checkLengthWarnings();
  updateSummary();
  updateTotalQuantity();
  setupNumberPad();
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    document.querySelector('.theme-toggle').innerHTML = '🌙';
  }
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker Registered'))
      .catch(err => console.error('Service Worker Error:', err));
  }
};
