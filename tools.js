function toRuMoney(number) {
    const formatter = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2,
    });
    const fraction = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
    });
    if (number.mod(1) == 0)
        return fraction.format(number);
    else
        return formatter.format(number);
}

function saveStateToUrl() {
    const state = {
        amount: amountEl.value,
        net: netRadio.checked,
        grossOptsData: JSON.stringify(grossOptsData),
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

    if (typeof loadedState['grossOptsData'] == 'string') {
        console.log(JSON.parse(loadedState['grossOptsData']));
        grossOptsData = JSON.parse(loadedState['grossOptsData']);
        renderGrossOptsData();
    }
}
