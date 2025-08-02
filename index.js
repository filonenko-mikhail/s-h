var amountEl = document.getElementById('amount');

var grossRadio = document.getElementById('grossRadio');
var netRadio = document.getElementById('netRadio');

var grossOpts = document.getElementById('grossOpts');
var grossOptsContainer = document.getElementById('grossOptsContainer');
var netOpts = document.getElementById('netOpts');

var grossOptsData = [];

function addGrossOpts() {
    if (grossOptsData.length > 10) {
        return
    }
    grossOptsData.push(
        {
            "amount": "1111",
            "month": "1",
        }
    )
}

function removeGrossOpts(index) {
    grossOptsData.splice(index, 1);
}

function renderGrossOptsData() {
    var templ = document.getElementById("grossOptsTemplate");
    var cont = document.getElementById("grossOptsContainer");

    cont.replaceChildren([]);
    for (let i = 0; i < grossOptsData.length; i++) {
        let clon = templ.content.cloneNode(true);
        let additionalAmount = clon.getElementById("additionalAmount");
        let removeBtn = clon.getElementById("remove");
        let changeLabel = clon.getElementById("change");
        let month = clon.getElementById("month");

        let index = i;
        removeBtn.addEventListener('click', function (e) {
            removeGrossOpts(index);
            renderGrossOptsData();
            calc(amountEl.value);
        });

        let currentData = grossOptsData[i]
        additionalAmount.value = currentData.amount;

        additionalAmount.addEventListener('change', function (e) {
            currentData.amount = additionalAmount.value;
            calc(amountEl.value);
        })

        changeLabel.innerHTML = "Изменение " + (i + 1)

        month.value = currentData.month;
        month.addEventListener('change', function (e) {
            currentData.month = month.value;
            calc(amountEl.value);
        })
        cont.appendChild(clon)
    }
}

renderGrossOptsData();

var addition = document.getElementById("grossAddition");
var input = document.getElementById("input");

var cont = document.getElementById("grossOptsContainer");
addition.addEventListener('click',
    function (e) {
        grossOptsContainer.classList.remove("hide")
        addGrossOpts();
        renderGrossOptsData();
    }
);



Decimal.set({ precision: 20, minE: -3 });

const arr = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
var tableBody = document.getElementById('tableBody');
var tableFoot = document.getElementById('tableFoot');

function removeSuffix(str, suffix) {
    if (str.endsWith(suffix)) {
        return str.slice(0, -suffix.length);
    }
    return str;
}

var data = [];

function calc(value) {
    tableBody.replaceChildren();
    tableFoot.replaceChildren();
    if (value == '') {
        return
    }
    var amount = new Decimal(0);
    try {
        amount = new Decimal(value);
    } catch (error) {
        alert("Неправильное значение суммы заработной платы");
        return;
    }

    if (netRadio.checked) {
        if (amount.gt('40598000')) {
            amount = amount.minus('1598000').div('0.78')
        } else if (amount.gt('16598000')) {
            amount = amount.minus('598000').div('0.80')
        } else if (amount.gt('4298000')) {
            amount = amount.minus('198000').div('0.82')
        } else if (amount.gt('2088000')) {
            amount = amount.minus('48000').div('0.85')
        } else {
            amount = amount.div(new Decimal('0.87'))
        }
    }

    var zones = [
        ['0', '2_400_000', '0.13',],
        ['2_400_000', '5_000_000', '0.15',],
        ['5_000_000', '20_000_000', '0.18',],
        ['20_000_000', '50_000_000', '0.20',],
        ['50_000_000', '+Infinity', '0.22',],
    ]

    var grossSum = Decimal(0);
    var netSum = Decimal(0);

    data = [];
    var nBase = Decimal(0);

    var maxMonth = 0;

    for (let i = 0; i < arr.length; i++) {
        var gross = amount;

        if (!netRadio.checked) {
            for (let gg = 0; gg < grossOptsData.length; gg++) {
                var additionalMonth = parseInt(grossOptsData[gg].month)
                if (i >= additionalMonth && additionalMonth >= maxMonth) {
                    gross = new Decimal(grossOptsData[gg].amount);
                    maxMonth = additionalMonth;
                }
            }
        }

        var start = nBase;
        var end = nBase.plus(gross);
        nBase = nBase.plus(gross);

        var slices = [];
        for (let z = 0; z < zones.length; z++) {
            var slice = new Decimal(0);
            if (start.gte(zones[z][0]) && start.lt(zones[z][1])) {
                var e = Decimal.min(end, zones[z][1]);
                var slice = [e.minus(start), zones[z][2]];

                if (e.minus(start).gt('0')) {
                    slices.push(slice);
                }
            } else if (start.lt(zones[z][0]) && end.gte(zones[z][0])) {
                var e = Decimal.min(end, zones[z][1]);
                var slice = [e.minus(zones[z][0]), zones[z][2]];

                if (e.minus(zones[z][0]).gt('0')) {
                    slices.push(slice);
                }
            }
        }

        var percents = [];
        var ndfl = new Decimal(0);
        for (let s = 0; s < slices.length; s++) {
            ndfl = ndfl.plus(slices[s][0].mul(slices[s][1]));

            percents.push(new Decimal(slices[s][1]).mul('100').toFixed(0) + "%");
        }

        console.log(gross.toFixed(2), end.toFixed(2), gross.minus(ndfl).toFixed(2), ndfl.toFixed(2), percents);
        data.push({
            "gross": gross,
            "base": end,
            "net": gross.minus(ndfl),
            "ndfl": ndfl,
            "percents": percents,
        })

        grossSum = grossSum.plus(gross);
        netSum = netSum.plus(gross.minus(ndfl));
    }

    for (let i = 0; i < arr.length; i++) {
        const row = document.createElement("tr");
        const month = document.createElement("th");
        month.setAttribute("scope", "row");
        month.textContent = arr[i];
        row.appendChild(month);

        const grossTd = document.createElement("td");
        grossTd.textContent = removeSuffix(data[i]['gross'].toFixed(2), '.00') + '₽';
        row.appendChild(grossTd);

        const nbaseTd = document.createElement("td");
        nbaseTd.textContent = removeSuffix(data[i]['base'].toFixed(2), '.00') + '₽';
        row.appendChild(nbaseTd);

        const netTd = document.createElement("td");
        netTd.textContent = removeSuffix(data[i]['net'].toFixed(2), '.00') + '₽';
        row.appendChild(netTd);

        const ndflTd = document.createElement("td");
        ndflTd.textContent = removeSuffix(data[i]['ndfl'].toFixed(2), '.00') + '₽';
        row.appendChild(ndflTd);

        const stTd = document.createElement("td");
        stTd.textContent = data[i]['percents'].join('->');
        row.appendChild(stTd);

        tableBody.appendChild(row);
    }

    const result = document.createElement("tr");
    result.className = 'table-info';

    const resultTd1 = document.createElement("th");
    resultTd1.setAttribute("scope", "row");
    resultTd1.textContent = "Итого";
    result.appendChild(resultTd1);

    const resultTd2 = document.createElement("td");
    resultTd2.textContent = removeSuffix(grossSum.toFixed(2), '.00') + '₽';
    result.appendChild(resultTd2);

    const resultTd3 = document.createElement("td");
    resultTd3.textContent = '';
    result.appendChild(resultTd3);

    const resultTd4 = document.createElement("td");
    resultTd4.textContent = removeSuffix(netSum.toFixed(2), '.00') + '₽';
    result.appendChild(resultTd4);
    const resultTd5 = document.createElement("td");
    resultTd5.textContent = '';
    result.appendChild(resultTd5);

    const resultTd6 = document.createElement("td");
    resultTd6.textContent = '';
    result.appendChild(resultTd6);

    tableFoot.appendChild(result);
}


function saveStateToUrl() {
    const state = {
        amount: amountEl.value,
        net: netRadio.checked,
    };
    const params = new URLSearchParams();
    for (const key in state) {
        params.set(key, state[key]);
    }
    history.pushState(state, '', `?${params.toString()}`);
}

function loadStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const loadedState = {};
    for (const [key, value] of params.entries()) {
        loadedState[key] = value;
    }
    // Apply loadedState to your application
    console.log('Loaded State:', loadedState);
    if (loadedState['amount'] != undefined) {
        amountEl.value = loadedState['amount'];
    }

    if (loadedState['net'] === 'true') {
        netRadio.checked = true;
        grossRadio.checked = false;
    } else {
        netRadio.checked = false;
        grossRadio.checked = true;
    }
}

function updateOptsVisibility() {
    if (netRadio.checked) {
        netOpts.classList.remove("hide")

        grossOpts.classList.add("hide")
        grossOptsContainer.classList.add("hide")
    } else {
        netOpts.classList.add("hide")

        grossOpts.classList.remove("hide")
        grossOptsContainer.classList.remove("hide")
    }
}
grossRadio.addEventListener('change', function () {
    calc(amountEl.value);
    saveStateToUrl();
    updateOptsVisibility();
});
netRadio.addEventListener('change', function () {
    calc(amountEl.value);
    saveStateToUrl();
    updateOptsVisibility();
});

amountEl.addEventListener("change", (event) => {
    calc(event.target.value);
    saveStateToUrl();
});

loadStateFromUrl();
updateOptsVisibility();
if (amountEl.value != undefined) {
    calc(amountEl.value);
}
window.addEventListener('popstate', function () {
    loadStateFromUrl();
    updateOptsVisibility();
    if (amountEl.value != undefined) {
        calc(amountEl.value);
    }
});