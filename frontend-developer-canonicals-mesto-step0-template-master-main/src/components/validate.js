function hasInvalidInput(inputs) {
  return inputs.some((input) => {
    return !input.validity.valid;
  });
}

function toggleButtonState(inputs, button, validationSettings) {
  if (hasInvalidInput(inputs)) {
    button.classList.add(validationSettings.buttonOffClass);
    button.disabled = true;
  } else {
    button.classList.remove(validationSettings.buttonOffClass);
    button.disabled = false;
  }
}

function applyInvalidStyle(input, errorElement, validationSettings) {
  input.classList.add(validationSettings.invalidInputClass);
  errorElement.classList.add(validationSettings.errorActiveClass);
  errorElement.textContent = input.validationMessage;
}

function applyValidStyle(input, errorElement, validationSettings) {
  input.classList.remove(validationSettings.invalidInputClass);
  errorElement.classList.remove(validationSettings.errorActiveClass);
  errorElement.textContent = "";
}

function manageValidation(form, input, validationSettings) {
  const errorElement = form.querySelector(`.${input.id}-error`);
  if (input.validity.valid)
    applyValidStyle(input, errorElement, validationSettings);
  else applyInvalidStyle(input, errorElement, validationSettings);
}

function addValidationToForm(form, validationSettings) {
  const inputs = Array.from(
    form.querySelectorAll(validationSettings.inputSelector)
  );
  const submitBtn = form.querySelector(validationSettings.buttonSelector);
  inputs.forEach((input) =>
    input.addEventListener("input", (evt) => {
      toggleButtonState(inputs, submitBtn, validationSettings);
      manageValidation(form, input, validationSettings);
    })
  );
  toggleButtonState(inputs, submitBtn, validationSettings);
}

const inputEvent = new Event("input", { bubbles: true });

function invokeValidation(form, validationSettings) {
  const inputs = Array.from(
    form.querySelectorAll(validationSettings.inputSelector)
  );
  inputs.forEach((input) => input.dispatchEvent(inputEvent));
}
function enableValidation(validationSettings) {
  const forms = Array.from(
    document.querySelectorAll(validationSettings.formSelector)
  );
  forms.forEach((form) => addValidationToForm(form, validationSettings));
}

export { enableValidation, invokeValidation };
