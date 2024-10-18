(function() {
    // Załaduj bibliotekę libphonenumber-js
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/libphonenumber-js/1.9.51/libphonenumber-js.min.js';
    script.onload = function() {
        // Po załadowaniu biblioteki, uruchom nasz kod walidacyjny
        document.addEventListener('DOMContentLoaded', function() {

            // Lista popularnych domen e-mail do zablokowania
            var popularEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];

            function validateInput(input) {
                var type = input.type;
                var value = input.value.trim();
                var isValid = true;
                var errorMessage = '';

                // Pobierz najbliższy label powiązany z inputem
                var label = input.closest('label') || input.previousElementSibling;

                switch(type) {
                    case 'tel':
                        var countryCode = input.getAttribute('data-flipico-country') || 'PL'; // Domyślnie Polska
                        try {
                            var phoneNumber = libphonenumber.parsePhoneNumber(value, countryCode.toUpperCase());
                            if (!phoneNumber.isValid()) {
                                isValid = false;
                                errorMessage = 'Proszę wprowadzić poprawny numer telefonu.';
                            }
                        } catch (e) {
                            isValid = false;
                            errorMessage = 'Proszę wprowadzić poprawny numer telefonu.';
                        }
                        break;
                    case 'email':
                        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            isValid = false;
                            errorMessage = 'Proszę wprowadzić poprawny adres e-mail.';
                        } else {
                            var blockPopular = input.getAttribute('data-flipico-block-popular-emails');
                            if (blockPopular === 'true') {
                                var emailDomain = value.split('@')[1];
                                if (popularEmailDomains.includes(emailDomain.toLowerCase())) {
                                    isValid = false;
                                    errorMessage = 'Proszę użyć firmowego adresu e-mail.';
                                }
                            }
                        }
                        break;
                    case 'password':
                        var minLength = 8;
                        if (value.length < minLength) {
                            isValid = false;
                            errorMessage = 'Hasło musi mieć co najmniej ' + minLength + ' znaków.';
                        }
                        break;
                    case 'number':
                        var numberValue = parseFloat(value);
                        if (isNaN(numberValue)) {
                            isValid = false;
                            errorMessage = 'Proszę wprowadzić poprawny numer.';
                        }
                        break;
                    case 'url':
                        var urlRegex = /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\w\-\.\@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?$/;
                        if (!urlRegex.test(value)) {
                            isValid = false;
                            errorMessage = 'Proszę wprowadzić poprawny adres URL.';
                        }
                        break;
                    default:
                        break;
                }

                // Ustawienia walidacji
                if (!isValid) {
                    input.setCustomValidity(errorMessage);
                    // Zmiana koloru labela na czerwony
                    if (label) {
                        label.style.color = 'red';
                    }
                } else {
                    input.setCustomValidity('');
                    // Przywróć domyślny kolor labela
                    if (label) {
                        label.style.color = '';
                    }
                }

                return isValid;
            }

            var inputs = document.querySelectorAll('input');

            inputs.forEach(function(input) {
                if (['tel', 'email', 'password', 'number', 'url'].includes(input.type)) {
                    // Sprawdzenie dopiero po opuszczeniu pola
                    input.addEventListener('blur', function() {
                        validateInput(input);
                    });
                }
            });

            var forms = document.querySelectorAll('form');

            forms.forEach(function(form) {
                form.addEventListener('submit', function(event) {
                    var isFormValid = true;

                    inputs.forEach(function(input) {
                        if (['tel', 'email', 'password', 'number', 'url'].includes(input.type)) {
                            if (!validateInput(input)) {  // Walidacja pełna na submit
                                isFormValid = false;
                            }
                        }
                    });

                    if (!isFormValid) {
                        console.log("Coś poszło nie tak!");
                        event.preventDefault();
                        event.stopPropagation();
                    }
                });
            });
        });
    };
    document.head.appendChild(script);
})();