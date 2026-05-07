// Date helper functions
function datePlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function defaultInFromOut(outDateStr) {
  const d = new Date(outDateStr);
  d.setDate(d.getDate() + 8);
  return d.toISOString().split('T')[0];
}

// Track manual changes to inDate
let inDateManuallyChanged = false;

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const agent = urlParams.get('agent') || 'WY992';
const flight = urlParams.get('flight') || 'default';
const adcode = urlParams.get('adcode') || '';
const promotionCode = urlParams.get('promotionCode') || '';
const locationParam = urlParams.get('Location') || urlParams.get('location') || '';

// Detect language and set domain
const pageLang = document.documentElement.lang || 'fr';
const LANG_DOMAINS = {
  'fr': 'book.parkcare.fr',
  'es': 'book.parkcare.es',
  'de': 'book.parkcare.de',
  'it': 'book.parkcare.it',
  'en': 'book.parkcare'
};
const basedomain = LANG_DOMAINS[pageLang] || 'book.parkcare.fr';

// Wizard state
let currentStep = 1;
const totalSteps = 3;

// Pre-select airport from URL parameter
if (locationParam) {
  const airportRadios = document.querySelectorAll('input[name="depart"]');
  airportRadios.forEach(radio => {
    if (radio.value.toUpperCase() === locationParam.toUpperCase()) {
      radio.checked = true;
      document.querySelector('.btn-next').disabled = false;
    }
  });
}

// Initialize dates
window.addEventListener('DOMContentLoaded', function() {
  const outDateInput = document.getElementById('outDate');
  const inDateInput = document.getElementById('inDate');

  outDateInput.value = datePlus(1);
  inDateInput.value = datePlus(9);

  // Set minimum dates
  const today = new Date().toISOString().split('T')[0];
  outDateInput.min = today;
  inDateInput.min = outDateInput.value;

  // Track manual changes to inDate
  inDateInput.addEventListener('change', function() {
    inDateManuallyChanged = true;
  });

  // Recalculate inDate when outDate changes
  outDateInput.addEventListener('change', function() {
    const newOutDate = this.value;
    inDateInput.min = newOutDate;

    if (!inDateManuallyChanged) {
      inDateInput.value = defaultInFromOut(newOutDate);
    }

    if (new Date(inDateInput.value) < new Date(newOutDate)) {
      inDateInput.value = defaultInFromOut(newOutDate);
      inDateManuallyChanged = false;
    }
  });
});

// Enable/disable next button on step 1 when airport is selected
document.querySelectorAll('input[name="depart"]').forEach(radio => {
  radio.addEventListener('change', function() {
    document.querySelector('.btn-next').disabled = false;
  });
});

// Next button handlers
document.querySelectorAll('.btn-next').forEach(btn => {
  btn.addEventListener('click', function() {
    if (currentStep < totalSteps) {
      nextStep();
    }
  });
});

// Back button handlers
document.querySelectorAll('.btn-back').forEach(btn => {
  btn.addEventListener('click', function() {
    if (currentStep > 1) {
      prevStep();
    }
  });
});

// Navigate to next step
function nextStep() {
  // Hide current step
  document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.remove('active');
  document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');
  document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('completed');

  // Show next step
  currentStep++;
  document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.add('active');
  document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navigate to previous step
function prevStep() {
  // Hide current step
  document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.remove('active');
  document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');

  // Show previous step
  currentStep--;
  document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.add('active');
  document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');
  document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('completed');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Form submission
document.getElementById('wizardForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const depart = document.querySelector('input[name="depart"]:checked').value;
  const outDate = document.getElementById('outDate').value;
  const outTime = document.getElementById('outTime').value;
  const inDate = document.getElementById('inDate').value;
  const inTime = document.getElementById('inTime').value;
  const lang = pageLang;

  // URL-encode times
  const encodedOutTime = outTime.replace(':', '%3A');
  const encodedInTime = inTime.replace(':', '%3A');

  // Build search URL following ParkCare pattern
  const searchUrl = `https://${basedomain}/static/?selectProduct=cp&#/categories?agent=${agent}&ppts=&customer_ref=&lang=${lang}&adults=2&depart=${depart}&terminal=&arrive=&flight=${flight}&in=${inDate}&out=${outDate}&park_from=${encodedOutTime}&park_to=${encodedInTime}&filter_meetandgreet=&filter_parkandride=&children=0&infants=0&redirectReferal=carpark&from_categories=true&adcode=${adcode}&promotionCode=${promotionCode}`;

  // Redirect to search
  window.location.href = searchUrl;
});
