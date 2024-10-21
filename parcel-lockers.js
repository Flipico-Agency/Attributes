(function() {
    // Load external stylesheets and scripts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://geowidget.inpost.pl/inpost-geowidget.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://geowidget.inpost.pl/inpost-geowidget.js';
    script.defer = true;
    document.head.appendChild(script);

    document.addEventListener('DOMContentLoaded', function() {
        // Initialize handlers for shipping methods
        function initializeShippingMethodHandlers() {
            const shippingMethodInputs = document.querySelectorAll('input[flipico-delivery="shipping-method-choice"]');

            if (shippingMethodInputs.length === 0) {
                console.log('Czekam na renderowanie elementów...');
                return;
            }

            function handleShippingMethodChange(event) {
                const selectedValue = event.target.value;
                console.log('Wybrana metoda dostawy:', selectedValue);

                shippingMethodInputs.forEach(input => {
                    input.checked = false;
                    input.removeAttribute('checked');
                });

                event.target.checked = true;
                event.target.setAttribute('checked', '');

                const inpostWidget = document.querySelector('[flipico-widget="inpost"]');
                const dhlWidget = document.querySelector('[flipico-widget="dhl"]');
                const parcelFieldInput = document.querySelector('[flipico-input="parcel-field"]');

                if (selectedValue === '66b3793346ac0078df04ddcc') {
                    inpostWidget.style.display = 'block';
                    dhlWidget.style.display = 'none';
                } else if (selectedValue === '66b3793346ac0078df04ddce') {
                    inpostWidget.style.display = 'none';
                    dhlWidget.style.display = 'block';
                } else {
                    inpostWidget.style.display = 'none';
                    dhlWidget.style.display = 'none';
                    if (parcelFieldInput) {
                        parcelFieldInput.value = '';
                    } else {
                        console.error('Nie znaleziono inputa o atrybucie flipico-input="parcel-field".');
                    }
                }
            }

            shippingMethodInputs.forEach(input => {
                input.addEventListener('change', handleShippingMethodChange);
            });

            const checkedInput = document.querySelector('input[flipico-delivery="shipping-method-choice"]:checked');
            if (checkedInput) {
                handleShippingMethodChange({ target: checkedInput });
            }
        }

        // Handle InPost widget point selection
        const geowidget = document.querySelector('[flipico-widget="geowidget"]');
        if (geowidget) {
            geowidget.addEventListener('inpost.geowidget.init', function(event) {
                const api = event.detail.api;
                api.changePosition({ longitude: 20.318968, latitude: 49.731131 }, 16);
            });
        }

        function handlePointSelection(event) {
            const selectedPoint = event;
            if (!selectedPoint) {
                console.error('Brak danych o wybranym punkcie.');
                return;
            }
            const parcelFieldInput = document.querySelector('[flipico-input="parcel-field"]');
            const shippingSection = document.querySelector('[flipico-section="shipping-section"]');
            const inpostWidget = document.querySelector('[flipico-widget="inpost"]');

            if (parcelFieldInput) {
                parcelFieldInput.value = selectedPoint.name;
                inpostWidget.style.display = 'none';
                shippingSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error('Nie znaleziono inputa o atrybucie flipico-input="parcel-field".');
            }
        }

        // DHL point selection handler
        function handleDHLPointSelection(event) {
            if (event.origin !== "https://parcelshop.dhl.pl") {
                return;
            }

            let pointData;
            try {
                pointData = typeof event.data === 'object' ? event.data : JSON.parse(event.data);
            } catch (e) {
                console.error('Nie udało się sparsować danych punktu DHL:', e);
                return;
            }

            const pointId = pointData.sap;
            const pointName = pointData.name;
            const pointAddress = `${pointData.street} ${pointData.streetNo}, ${pointData.city}`;

            const parcelFieldInput = document.querySelector('[flipico-input="parcel-field"]');
            const shippingSection = document.querySelector('[flipico-section="shipping-section"]');
            const dhlWidget = document.querySelector('[flipico-widget="dhl"]');

            if (parcelFieldInput) {
                parcelFieldInput.value = pointId;
                dhlWidget.style.display = 'none';
                shippingSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error('Nie znaleziono inputa o atrybucie flipico-input="parcel-field".');
            }

            console.log(`Wybrano punkt: ${pointName} (${pointId})\nAdres: ${pointAddress}`);
        }

        if (window.addEventListener) {
            window.addEventListener("message", handleDHLPointSelection, false);
        } else {
            window.attachEvent("onmessage", handleDHLPointSelection);
        }

        const observer = new MutationObserver(function() {
            initializeShippingMethodHandlers();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        initializeShippingMethodHandlers();
    });
})();
