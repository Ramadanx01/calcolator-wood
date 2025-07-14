function addRow() {
  const lengthRows = document.querySelectorAll('.length-row');
  const row = document.createElement('div');
  row.className = 'length-row';
  row.innerHTML = `
    <input type="number" class="length" min="0" max="600" placeholder="الطول (سم)" required />
    ${lengthRows.length === 0 ? `
      <input type="number" class="count" min="0" placeholder="العدد" required />
      <button onclick="decreaseLength(this)">-30 سم</button>
      <button onclick="increaseLength(this)">+30 سم</button>
    ` : `
      <input type="text" class="prev-length" readonly placeholder="الطول السابق" />
      <input type="number" class="count" min="0" placeholder="العدد" required />
      <button onclick="increaseLength(this)">+30 سم</button>
    `}
    <button onclick="removeRow(this.parentNode)">حذف</button>
  `;
  document.getElementById('lengths').appendChild(row);
  updatePrevLengths();
}

function decreaseLength(button) {
  const input = button.parentNode.querySelector('.length');
  const value = parseInt(input.value || 0) - 30;
  input.value = Math.max(0, value);
  updatePrevLengths();
  checkLengthWarnings();
}

function increaseLength(button) {
  const input = button.parentNode.querySelector('.length');
  const value = parseInt(input.value || 0) + 30;
  input.value = Math.min(600, value);
  updatePrevLengths();
  checkLengthWarnings();
}

function removeRow(row) {
  row.remove();
  updatePrevLengths();
  checkLengthWarnings();
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
}

function calculate() {
  const thicknessMM = parseFloat(document.getElementById('thickness').value) || 0;
  const thicknessCM = thicknessMM / 10; // ✅ التحويل من مليمتر إلى سنتيمتر

  const width = parseFloat(document.getElementById('width').value) || 0;
  const lengths = document.querySelectorAll('.length');
  const counts = document.querySelectorAll('.count');
  const warningDiv = document.getElementById('warning');

  if (thicknessCM <= 0 || width <= 0 || lengths.length === 0) {
    warningDiv.innerHTML = '<p>يرجى إدخال التخانة، العرض، والطول بشكل صحيح. <span class="close-warning" style="cursor: pointer; color: #fff; padding: 0 5px; float: left;">X</span></p>';
    warningDiv.style.display = 'block';
    const closeButton = warningDiv.getElementsByClassName('close-warning')[0];
    closeButton.onclick = () => {
      warningDiv.style.display = 'none';
      clearTimeout(checkLengthWarnings.timeout);
    };
    checkLengthWarnings.timeout = setTimeout(() => {
      warningDiv.style.display = 'none';
    }, 5000);
    return;
  }

  let hasInvalidLength = false;
  lengths.forEach((input, index) => {
    const length = parseFloat(input.value) || 0;
    if (length > 600) {
      hasInvalidLength = true;
    }
  });

  if (hasInvalidLength) {
    checkLengthWarnings();
    return;
  }

  warningDiv.style.display = 'none';

  let lengthMap = {};
  for (let i = 0; i < lengths.length; i++) {
    const length = parseFloat(lengths[i].value) || 0;
    const count = parseInt(counts[i].value) || 0;
    if (length > 0 && count > 0) {
      if (length in lengthMap) {
        lengthMap[length] += count;
      } else {
        lengthMap[length] = count;
      }
    }
  }

  let totalVolumeCM = 0;
  for (const [length, count] of Object.entries(lengthMap)) {
    totalVolumeCM += thicknessCM * width * parseFloat(length) * count;
  }

  const volumeM = totalVolumeCM / 1000000;
  const pricePerM3 = parseFloat(document.getElementById('pricePerM3').value) || 0;
  const totalPrice = pricePerM3 > 0 ? (volumeM * pricePerM3).toFixed(2) : 'غير محدد';

  // ✅ عرض المتر المكعب بنفس ترتيب السم المكعب (4 أرقام بعد العلامة على الأقل)
  const volumeMFormatted = volumeM.toFixed(6).slice(0, 7); // مثل: "0.0012" أو "2.3000"

  document.getElementById('volumeCM').innerText = totalVolumeCM.toFixed(0);
  document.getElementById('volumeM').innerText = volumeMFormatted;
  document.getElementById('totalPrice').innerText = totalPrice;
}

function clearCalculation() {
  document.getElementById('thickness').value = '';
  document.getElementById('width').value = '';
  document.getElementById('pricePerM3').value = '';
  document.getElementById('lengths').innerHTML = `
    <div class="length-row">
      <input type="number" class="length" min="0" max="600" placeholder="الطول (سم)" required />
      <input type="number" class="count" min="0" placeholder="العدد" required />
      <button onclick="decreaseLength(this)">-30 سم</button>
      <button onclick="increaseLength(this)">+30 سم</button>
      <button onclick="removeRow(this.parentNode)">حذف</button>
    </div>
  `;
  document.getElementById('results').innerHTML = `
    <p>التكعيب (سم³): <span id="volumeCM">0</span></p>
    <p>التكعيب (م³): <span id="volumeM">0.0000</span></p>
    <p>السعر الكلي: <span id="totalPrice">غير محدد</span></p>
  `;
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  const themeButton = document.querySelector('.theme-toggle');
  themeButton.innerHTML = isDark ? '🌙' : '☀️';
}

window.onload = function () {
  updatePrevLengths();
  checkLengthWarnings();
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
