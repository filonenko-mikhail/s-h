Decimal.set({ precision: 20, minE: -3 })

var data = []

var amountEl = document.getElementById('amount')

var grossRadio = document.getElementById('grossRadio')
var netRadio = document.getElementById('netRadio')

var grossControls = document.getElementById('grossControls')
var grossOptsContainer = document.getElementById('grossOptsContainer')
var netControls = document.getElementById('netControls')

var grossFromNetBanner = document.getElementById('alert-gross-from-net')
var grossFromNetBannerText = document.getElementById('alert-gross-from-net-text')

var addition = document.getElementById("grossAddition")
var input = document.getElementById("input")

var alertNetCompensation = document.getElementById('alert-net-compensation')
var alertNetCompensationText = document.getElementById('alert-net-compensation-text')

var grossOptsData = []

function addGrossOpts() {
    if (grossOptsData.length > 10) {
        return
    }
    additionalAmount = amountEl.value
    var monthItem = 1
    if (grossOptsData.length > 0) {
        additionalAmount = grossOptsData[grossOptsData.length - 1]['amount']
        monthItem = grossOptsData[grossOptsData.length - 1]['month'] + 1
        console.log(monthItem)
        if (monthItem > 11) {
            monthItem = 11
        }
    }

    grossOptsData.push(
        {
            "amount": additionalAmount,
            "month": monthItem,
        }
    )
    console.log(grossOptsData)
    saveStateToUrl()
}

function removeGrossOpts(index) {
    grossOptsData.splice(index, 1)
    saveStateToUrl()
}

function renderGrossOptsData() {
    var templ = document.getElementById("grossOptsTemplate")
    var cont = document.getElementById("grossOptsContainer")

    cont.replaceChildren([])
    for (let i = 0; i < grossOptsData.length; i++) {
        let clon = templ.content.cloneNode(true)
        let additionalAmount = clon.getElementById("additionalAmount")
        let removeBtn = clon.getElementById("remove")
        let changeLabel = clon.getElementById("change")
        let month = clon.getElementById("month")

        let index = i
        removeBtn.addEventListener('click', function (e) {
            removeGrossOpts(index)
            renderGrossOptsData()
            calc(amountEl.value)
        })

        let currentData = grossOptsData[i]
        additionalAmount.value = currentData.amount

        additionalAmount.addEventListener('change', function (e) {
            currentData.amount = additionalAmount.value
            calc(amountEl.value)
            saveStateToUrl()
        })

        changeLabel.innerHTML = "Изменение " + (i + 1)
        if (i + 1 < 10) {
            changeLabel.innerHTML = changeLabel.innerHTML + ""
        }

        month.value = currentData.month
        month.addEventListener('change', function (e) {
            currentData.month = month.value
            calc(amountEl.value)
            saveStateToUrl()
        })
        cont.appendChild(clon)
    }
}

addition.addEventListener('click',
    function (e) {
        grossOptsContainer.removeAttribute('hidden')
        addGrossOpts()
        renderGrossOptsData()
    }
)

const arr = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
var tableBody = document.getElementById('tableBody')
var tableFoot = document.getElementById('tableFoot')

function calcGrossAmount(value) {
    value = value.replaceAll(' ', '')
    if (value == '') {
        return new Decimal(0)
    }
    var amount = new Decimal(0)
    try {
        amount = new Decimal(value)
    } catch (error) {
        console.log(error)
        alert("Неправильное значение суммы заработной платы")
        return new Decimal(0)
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
    return amount
}

function calc(value) {
    tableBody.replaceChildren()
    tableFoot.replaceChildren()
    value = value.replaceAll(' ', '')
    if (value == '') {
        return
    }

    amount = calcGrossAmount(value)
    if (amount.isZero()) {
        alertNetCompensation.setAttribute('hidden', '')
        return
    }
    var zones = [
        ['0', '2_400_000', '0.13',],
        ['2_400_000', '5_000_000', '0.15',],
        ['5_000_000', '20_000_000', '0.18',],
        ['20_000_000', '50_000_000', '0.20',],
        ['50_000_000', '+Infinity', '0.22',],
    ]
    var grossSum = Decimal(0)
    var netSum = Decimal(0)
    var ndflSum = Decimal(0)
    data = []
    var nBase = Decimal(0)
    var maxMonth = 0
    var netAmounts = []

    for (let i = 0; i < arr.length; i++) {
        var gross = amount
        if (!netRadio.checked && i != 0) {
            for (let gg = 0; gg < grossOptsData.length; gg++) {
                var additionalMonth = parseInt(grossOptsData[gg].month)
                if (i >= additionalMonth && additionalMonth >= maxMonth) {
                    gross = new Decimal(grossOptsData[gg].amount)
                    maxMonth = additionalMonth
                }
            }
        }

        var start = nBase
        var end = nBase.plus(gross)
        nBase = nBase.plus(gross)

        var slices = []
        for (let z = 0; z < zones.length; z++) {
            var slice = new Decimal(0)
            if (start.gte(zones[z][0]) && start.lt(zones[z][1])) {
                var e = Decimal.min(end, zones[z][1])
                var slice = [e.minus(start), zones[z][2]]

                if (e.minus(start).gt('0')) {
                    slices.push(slice)
                }
            } else if (start.lt(zones[z][0]) && end.gte(zones[z][0])) {
                var e = Decimal.min(end, zones[z][1])
                var slice = [e.minus(zones[z][0]), zones[z][2]]

                if (e.minus(zones[z][0]).gt('0')) {
                    slices.push(slice)
                }
            }
        }

        var percents = []
        var ndfl = new Decimal(0)
        for (let s = 0; s < slices.length; s++) {
            ndfl = ndfl.plus(slices[s][0].mul(slices[s][1]))

            percents.push(
                {
                    ndflPartAmount: slices[s][0].mul(slices[s][1]),
                    percent: new Decimal(slices[s][1]).mul('100').toFixed(0) + "%",
                })
        }

        console.log(gross.toFixed(2), end.toFixed(2), gross.minus(ndfl).toFixed(2), ndfl.toFixed(2), percents)
        data.push({
            "gross": gross,
            "base": end,
            "net": gross.minus(ndfl),
            "ndfl": ndfl,
            "percents": percents,
        })

        ndflSum = ndflSum.plus(ndfl)
        grossSum = grossSum.plus(gross)
        netSum = netSum.plus(gross.minus(ndfl))
        if (i == 0) {
            netAmounts.push(gross.minus(ndfl))
        }
    }

    for (let i = 0; i < arr.length; i++) {
        var templ = document.getElementById("trTemplate")
        let clon = templ.content.cloneNode(true)

        var col1 = clon.getElementById("col1")
        col1.textContent = arr[i]
        var col2 = clon.getElementById("col2")
        col2.textContent = toRuMoney(data[i]['gross'])
        var col3 = clon.getElementById("col3")
        col3.textContent = toRuMoney(data[i]['base'])
        var col4 = clon.getElementById("col4")
        col4.textContent = toRuMoney(data[i]['net'])
        var col5 = clon.getElementById("col5")
        col5.textContent = toRuMoney(data[i]['ndfl'])

        var descriptions = []
        var p = []
        var percents = data[i]['percents']

        for (let j = 0; j < percents.length; j++) {
            p.push(percents[j]['percent'])
            var amount = toRuMoney(percents[j]['ndflPartAmount'])
            descriptions.push(`${amount} для процента ${percents[j]['percent']}`)
        }
        var part = descriptions.join(', ');
        var ndflAmount = toRuMoney(data[i]['ndfl']);
        
        var col6 = clon.getElementById("col6");
        col6.innerHTML = p.join('&#8594;');

        tableBody.appendChild(clon);

        if (descriptions.length > 1) {
            var bannerPercentJoin = `Общая сумма налогов составляет ${ndflAmount} из них: ${part}`;

            var templ = document.getElementById("trBannerTemplate")
            let clon = templ.content.cloneNode(true)

            var col1 = clon.getElementById("col1")
            col1.innerHTML = bannerPercentJoin
            tableBody.appendChild(clon)
        }

        if (i > 0) {
            var prevPercents = data[i - 1]['percents']
            var prevPercentValue = prevPercents[prevPercents.length - 1]['percent']
            if (prevPercentValue != percents[0]['percent']) {
                var bannerPercentChange = "В этом месяце налоговая ставка изменилась: " + prevPercentValue.toString() + "&#8594;" + percents[0]['percent']
                
                var templ = document.getElementById("trBannerTemplate")
                let clon = templ.content.cloneNode(true)

                var col1 = clon.getElementById("col1")
                col1.innerHTML = bannerPercentChange
                tableBody.appendChild(clon)
            }
        }

    }

    var templ = document.getElementById("trTemplate");
    let clon = templ.content.cloneNode(true);
    var col1 = clon.getElementById("col1")
    col1.textContent = "Итого";
    var col2 = clon.getElementById("col2")
    col2.textContent = toRuMoney(grossSum);
    var col3 = clon.getElementById("col3")
    col3.textContent = '';
    var col4 = clon.getElementById("col4")
    col4.textContent = toRuMoney(netSum);
    var col5 = clon.getElementById("col5")
    col5.textContent = toRuMoney(ndflSum);
    var col6 = clon.getElementById("col6")
    col6.textContent = '';

    tableFoot.appendChild(clon);


    if (netRadio.checked) {
        amount = data[0]['net'];
        bonus = amount.mul(12).minus(netSum);
        console.log(bonus.toFixed(2));
        if (bonus.gt(0)) {
            alertNetCompensation.removeAttribute('hidden');
            var bonusStr = toRuMoney(bonus);
            alertNetCompensationText.innerHTML =
                `Для компенсации снижения заработной платы после вычета налогов можно использовать премию размером ${bonusStr}`;
        } else {
            alertNetCompensation.setAttribute('hidden', '');
        }
    } else {
        alertNetCompensation.setAttribute('hidden', '');
    }
}

function updateOptsVisibility() {
    if (netRadio.checked) {
        netControls.removeAttribute('hidden');

        grossControls.setAttribute("hidden", '');
        grossOptsContainer.setAttribute("hidden", '');
    } else {
        netControls.setAttribute("hidden", '');

        grossControls.removeAttribute("hidden");
        grossOptsContainer.removeAttribute("hidden");
    }
}
grossRadio.addEventListener('change', function () {
    calc(amountEl.value);
    saveStateToUrl();
    updateOptsVisibility();
    updateGrossFromNetBanner();
});
netRadio.addEventListener('change', function () {
    calc(amountEl.value);
    saveStateToUrl();
    updateOptsVisibility();
    updateGrossFromNetBanner();
});

amountEl.addEventListener("change", (event) => {
    calc(event.target.value);
    saveStateToUrl();
    updateGrossFromNetBanner();
});

function updateGrossFromNetBanner() {
    if (netRadio.checked) {
        var gross = calcGrossAmount(amountEl.value);
        if (!gross.isZero()) {
            var output = toRuMoney(gross);
            grossFromNetBannerText.innerHTML = `Сумма заработной платы до вычета налогов (gross) в месяц составит ${output}`;
            grossFromNetBanner.removeAttribute('hidden');
        } else {
            grossFromNetBanner.setAttribute("hidden", '');
        }
    } else {
        grossFromNetBanner.setAttribute("hidden", '');
    }
}

loadStateFromUrl();
updateOptsVisibility();
window.addEventListener('popstate', function () {
    loadStateFromUrl();
    updateOptsVisibility();
    if (amountEl.value != undefined) {
        calc(amountEl.value);
    }
});

if (amountEl.value != undefined) {
    calc(amountEl.value);
}
renderGrossOptsData();
updateGrossFromNetBanner();