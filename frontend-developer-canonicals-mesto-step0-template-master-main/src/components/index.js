// import "../pages/index.css";

import { createCard as createCardRaw } from "./cards.js";
import {
  openModal as openModalRaw,
  closeModal as closeModalRaw,
} from "./modal.js";
import { enableValidation, invokeValidation } from "./validate.js";
import { Connection } from "./api.js";
// import { ids } from "webpack";

function closeByEsc(evt) {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".popup_is-opened");
    closeModal(openedPopup);
  }
}

function openModal(popup) {
  Array.from(popup.querySelectorAll(validationSettings.formSelector)).forEach(
    (form) => invokeValidation(form, validationSettings)
  );
  document.addEventListener("keydown", closeByEsc);
  openModalRaw(popup);
}

function closeModal(popup) {
  document.removeEventListener("keydown", closeByEsc);
  closeModalRaw(popup);
}

function lockButtonOnLoading(popup) {
  const btn = popup.querySelector(".button");
  btn.disabled = true;
  btn.textContent = "Сохранение...";
}

function unlockButtonOnLoading(popup) {
  const btn = popup.querySelector(".button");
  btn.disabled = false;
  btn.textContent = "Сохранить";
}

function handleCardDelete(deleteBtn, cardId) {
  connection
    .fetchDelete(`cards/${cardId}`)
    .then((res) => {
      if (res.ok) return deleteBtn.closest(".card").remove();
      return Promise.reject(res);
    })
    .catch((res) => alert(res.status));
}

function updateLikesCnt(cardElement, cnt) {
  cardElement.querySelector(".card__likes-cnt").textContent = cnt;
}

function setLike(likeBtn, card, cardElement) {
  connection
    .fetchPut(`cards/likes/${card._id}`)
    .then((res) => {
      if (res.ok) return res.json();
      return Promise.reject(res);
    })
    .then((card) => {
      updateLikesCnt(cardElement, card.likes.length);
      likeBtn.classList.toggle("card__like-button_is-active");
    })
    .catch((res) => alert(res.status));
}

function removeLike(likeBtn, card, cardElement) {
  connection
    .fetchDelete(`cards/likes/${card._id}`)
    .then((res) => {
      if (res.ok) return res.json();
      return Promise.reject(res);
    })
    .then((card) => {
      updateLikesCnt(cardElement, card.likes.length);
      likeBtn.classList.toggle("card__like-button_is-active");
    })
    .catch((res) => alert(res.status));
}

function handleLikeClick(likeBtn, card, cardElement) {
  let active = likeBtn.classList.contains("card__like-button_is-active");
  if (active) {
    removeLike(likeBtn, card, cardElement);
  } else {
    setLike(likeBtn, card, cardElement);
  }
}

function createCard(card) {
  let template = createCardRaw(card);
  const imgContainer = template.querySelector(".card__image");

  if (card.owner && card.owner._id === clientInfo._id) {
    const deleteBtn = template.querySelector(".card__delete-button");
    deleteBtn.classList.remove("card__delete-button-disabled");

    deleteBtn.addEventListener("click", () => {
      handleCardDelete(deleteBtn, card._id, template);
    });
  }

  const likeBtn = template.querySelector(".card__like-button");

  likeBtn.addEventListener("click", () => {
    handleLikeClick(likeBtn, card, template);
  });

  if (card.likes.some((us) => us._id === clientInfo._id))
    likeBtn.classList.add("card__like-button_is-active");
  //проверка что я нажал
  updateLikesCnt(template, card.likes.length);
  imgContainer.addEventListener("click", () => {
    popImage.src = card.link;
    popImage.alt = card.name;
    popCaption.textContent = card.name;
    openModal(imagePopup);
  });
  return template;
}

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  changeProfileInfoOnServer(nameInput.value, jobInput.value, profilePopup);
}

function addCardRequest(card, popup, cardStore) {
  lockButtonOnLoading(popup);
  connection
    .fetchPost("cards", card)
    .then((res) => {
      if (res.ok) return res.json();
      return Promise.reject(res);
    })
    .then((card) => {
      cardStore.insertBefore(createCard(card), list.querySelector(".card"));
      closeModal(popup);
    })
    .catch((res) => alert(res.status))
    .finally(() => unlockButtonOnLoading(popup));
}

function handleCardFormSubmit(evt) {
  evt.preventDefault();
  let card = {
    name: cardNameInput.value,
    link: cardUrl.value,
  };
  addCardRequest(card, cardPopup, list);
}

function handleChangeAvatarSubmit(evt) {
  lockButtonOnLoading(changeAvatarPopup);
  let url = avatarUrl.value;
  connection
    .fetchPatch("users/me/avatar", { avatar: url })
    .then((res) => {
      if (res.ok) {
        changeProfileAvatar(url);
        return closeModal(changeAvatarPopup);
      }
      return Promise.reject(res);
    })
    .catch((err) => alert(`Ошибка при изменении аватара ${err.status}`))
    .finally(() => unlockButtonOnLoading(changeAvatarPopup));
}

function initCards(cards, cardsStore) {
  cards.forEach((card) => {
    let element = createCard(card);
    //Менять иконку лайка если ты в списке likes
    cardsStore.append(element);
  });
}

function loadProfile() {
  connection
    .fetchGet("users/me")
    .then((res) => {
      if (res.ok) return res.json();
      return Promise.reject(res);
    })
    .then((profile) => {
      changeProfileElements(profile);
      clientInfo._id = profile._id;
    })
    .catch((res) => alert(res.status));
}

function loadCards(connection, cardsStore) {
  connection
    .fetchGet("cards")
    .then((res) => {
      if (res.ok) return res.json();
      return Promise.reject(res.statusCode);
    })
    .then((cards) => {
      initCards(cards, cardsStore);
    })
    .catch((res) => alert(res.status));
}

function changeProfileAvatar(avatarUrl) {
  profileImage.style.backgroundImage = `url('${avatarUrl}')`;
}

function changeProfileElements(profile) {
  profileTitle.textContent = profile.name;
  profileDescription.textContent = profile.about;
  changeProfileAvatar(profile.avatar);
}

function changeProfileInfoOnServer(name, about, profilePopup) {
  lockButtonOnLoading(profilePopup);
  connection
    .fetchPatch("users/me", { name, about })
    .then((res) => {
      if (res.ok) return res.json();
      return Promise.reject(res);
    })
    .then((profile) => {
      changeProfileElements(profile);
      closeModal(profilePopup);
    })
    .catch((res) => alert(res.status))
    .finally(() => unlockButtonOnLoading(profilePopup));
  closeModal(profilePopup);
}

const clientInfo = {
  group: "apf-cohort-202",
  id: "a2f2f6a1-af28-4095-954c-48b532b948dd",
};

const connection = new Connection(
  "https://nomoreparties.co",
  clientInfo.group,
  clientInfo.id
);

//https://pictures.s3.yandex.net/frontend-developer/cards-compressed/chelyabinsk-oblast.jpg
const profilePopup = document.querySelector(".popup_type_edit");
const cardPopup = document.querySelector(".popup_type_new-card");
const imagePopup = document.querySelector(".popup_type_image");
const changeAvatarPopup = document.querySelector(".popup_type_new-avatar");

[(profilePopup, cardPopup, imagePopup, changeAvatarPopup)].forEach((el) => {
  el.classList.add("popup_is-animated");
  el.addEventListener("mousedown", (evt) => {
    if (evt.target.classList.contains("popup")) closeModal(el);
  });
});

const profileForm = profilePopup.querySelector(".popup__form");
const cardForm = cardPopup.querySelector(".popup__form");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileImage = document.querySelector(".profile__image");

profileImage.addEventListener("click", () => {
  openModal(changeAvatarPopup);
});

const avatarUrl = changeAvatarPopup.querySelector("#avatar-url");

changeAvatarPopup
  .querySelector(".popup__close")
  .addEventListener("click", () => {
    closeModal(changeAvatarPopup);
    avatarUrl.value = "";
  });
changeAvatarPopup.addEventListener("submit", (evt) => {
  evt.preventDefault();
  handleChangeAvatarSubmit(evt);
});

const nameInput = profilePopup.querySelector(".popup__input_type_name");
const jobInput = profilePopup.querySelector(".popup__input_type_description");

nameInput.value = profileTitle.textContent;
jobInput.value = profileDescription.textContent;

const cardNameInput = cardPopup.querySelector(".popup__input_type_card-name");
const cardUrl = cardPopup.querySelector(".popup__input_type_url");

const popImage = imagePopup.querySelector(".popup__image");
const popCaption = imagePopup.querySelector(".popup__caption");

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);

document
  .querySelector(".profile__edit-button")
  .addEventListener("click", () => {
    nameInput.value = profileTitle.textContent;
    jobInput.value = profileDescription.textContent;

    openModal(profilePopup);
  });

profilePopup.querySelector(".popup__close").addEventListener("click", () => {
  closeModal(profilePopup);
  nameInput.value = "";
  jobInput.value = "";
});

document.querySelector(".profile__add-button").addEventListener("click", () => {
  cardNameInput.value = "";
  cardUrl.value = "";
  openModal(cardPopup);
});

cardPopup.querySelector(".popup__close").addEventListener("click", () => {
  closeModal(cardPopup);
  cardNameInput.value = "";
  cardUrl.value = "";
});

imagePopup.querySelector(".popup__close").addEventListener("click", () => {
  closeModal(imagePopup);
});

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  buttonSelector: ".popup__button",
  buttonOffClass: "popup__button-disabled",
  invalidInputClass: "popup__input_type_error",
  errorActiveClass: "popup__input-error_active",
};

enableValidation(validationSettings);

loadProfile(connection);

const list = document.querySelector(".places__list");
loadCards(connection, list);
