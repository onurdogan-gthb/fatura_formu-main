const rowAmount = 40; // number of rows can be changed from here dynamically
const halfRowAmount = Math.ceil(rowAmount / 2);

function createRows(containerId, startIndex, endIndex) {
    const container = document.getElementById(containerId);
    for (let i = startIndex; i <= endIndex; i++) {
        const rowHTML = `
<div style="display: flex; text-align: center; margin-bottom: 10px;">
    <div class="detail-box" style="flex: 0 0 10%; border: 1px dashed; margin-right: 10px; display: flex; align-items: center; justify-content: center;">
        <p class="sira-no" id="sira-${i}" style="margin: 0;">${i}</p>
    </div>
    <div class="container-alt-basliklar" style="display: flex; flex-wrap: wrap; flex: 1;">
        <div class="detail-box" style="flex: 2; border: 1px solid; margin-right: 10px; display: flex; flex-direction: column;">
            <input type="text" class="tarih" id="tarih-${i}" name="tarih-${i}" style="width: 100%; height: 100%; box-sizing: border-box; border: none; text-align: center; padding: 0; margin: 0;">
        </div>
        <div class="detail-box" style="flex: 1; border: 1px solid; margin-right: 10px; display: flex; flex-direction: column;">
            <input type="text" class="no" id="no-${i}" name="no-${i}" style="width: 100%; height: 100%; box-sizing: border-box; border: none; text-align: center; padding: 0; margin: 0;">
        </div>
        <div class="detail-box" style="flex: 5; border: 1px solid; margin-right: 10px; display: flex; flex-direction: column;">
            <input type="text" class="kisi" id="kisi-${i}" name="kisi-${i}" style="width: 100%; height: 100%; box-sizing: border-box; border: none; text-align: center; padding: 0; margin: 0;">
        </div>
        <div class="detail-box" style="flex: 2; border: 1px solid; margin-right: 10px; display: flex; flex-direction: column;">
            <select class="vergi-turu" id="vergi-turu-${i}" name="vergi-turu-${i}" style="width: 100%; height: 100%; box-sizing: border-box; border: none; text-align: center; padding: 0; margin: 0;">
                <option value="" selected></option>
                <option value="fatura">Fatura</option>
                <option value="fis">Fiş</option>
                <option value="makbuz">Makbuz</option>
            </select>
        </div>
        <div class="detail-box" style="flex: 2; border: 1px solid; display: flex; flex-direction: column;">
            <input type="text" class="tutar" id="tutar-${i}" name="tutar-${i}" style="width: 100%; height: 100%; box-sizing: border-box; border: none; text-align: center; padding: 0; margin: 0;">
        </div>
    </div>
</div>
        `;
        container.innerHTML += rowHTML;
    }
}

// Create rows in two containers
createRows('dynamic-rows-container-left', 1, halfRowAmount);
createRows('dynamic-rows-container-right', halfRowAmount + 1, rowAmount);

function getTodayDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return dd + '.' + mm + '.' + yyyy;
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.tarih').forEach(input => {
        const dropdown = document.createElement('div');
        dropdown.className = 'date-dropdown';
        dropdown.style.display = 'none';
        dropdown.style.position = 'absolute';
        dropdown.style.backgroundColor = 'white';
        dropdown.style.border = '1px solid #ccc';
        dropdown.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        dropdown.style.padding = '4px';
        dropdown.style.zIndex = '1000';
        dropdown.style.top = '125%';
        dropdown.style.left = '50%';
        dropdown.style.transform = 'translateX(-50%)';
        dropdown.style.width = 'calc(100% + 4px)';
        dropdown.style.boxSizing = 'border-box';
        dropdown.style.fontSize = '10px';

        const todayOption = document.createElement('div');
        todayOption.textContent = "Bugün? " + getTodayDate();
        todayOption.style.cursor = 'pointer';
        todayOption.style.padding = '2px 5px';
        todayOption.style.borderRadius = '2px';
        todayOption.style.transition = 'background-color 0.2s';
        todayOption.onmouseover = function () {
            this.style.backgroundColor = '#f0f0f0';
        };
        todayOption.onmouseout = function () {
            this.style.backgroundColor = 'transparent';
        };
        todayOption.onclick = function () {
            input.value = getTodayDate();
            dropdown.style.display = 'none';
        };

        dropdown.appendChild(todayOption);
        input.parentNode.style.position = 'relative';
        input.parentNode.appendChild(dropdown);

        let showTimeout;
        input.addEventListener('focus', function () {
            showTimeout = setTimeout(() => {
                dropdown.style.display = 'block';
            }, 200);
        });

        input.addEventListener('blur', function (e) {
            clearTimeout(showTimeout);
            if (!dropdown.contains(e.relatedTarget)) {
                dropdown.style.display = 'none';
            }
        });

        dropdown.addEventListener('mousedown', function (e) {
            e.preventDefault();
        });
    });
});

function saveData() {
    const data = {
        rows: [],
        summary: {}
    };

    // Collect data from form fields
    for (let i = 1; i <= rowAmount; i++) {
        const tarihElement = document.getElementById(`tarih-${i}`);
        const noElement = document.getElementById(`no-${i}`);
        const kisiElement = document.getElementById(`kisi-${i}`);
        const vergiTuruElement = document.getElementById(`vergi-turu-${i}`);
        const tutarElement = document.getElementById(`tutar-${i}`);

        const row = {
            sira: i,
            tarih: tarihElement ? tarihElement.value : '',
            no: noElement ? noElement.value : '',
            kisi: kisiElement ? kisiElement.value : '',
            vergiTuru: vergiTuruElement ? vergiTuruElement.value : '',
            tutar: tutarElement ? tutarElement.value : ''
        };
        data.rows.push(row);
    }

    // Collect summary data
    data.summary = {
        genel_toplam_adet: document.getElementById('genel-toplam-adet')?.value || '',
        genel_toplam_tutar: document.getElementById('genel-toplam-tutar')?.value || ''
    };

    fetch('save_data.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(result => {
        if (result.message) {
            alert('Success: ' + result.message);
        } else if (result.error) {
            alert('Error: ' + result.error);
        }
    })
    .catch(error => {
        alert('An error occurred while saving the data: ' + error.message);
    });
}