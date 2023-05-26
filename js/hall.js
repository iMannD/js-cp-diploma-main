"use strict";

document.addEventListener("DOMContentLoaded", () => {
 
  const dataOfTheSelectedSeance = getJSON("data-of-the-selected-seance");

  const timestamp = +dataOfTheSelectedSeance.seanceTimeStamp / 1000;
  const hallId = dataOfTheSelectedSeance.hallId;
  const seanceId = dataOfTheSelectedSeance.seanceId;
  const requestBodyString = `event=get_hallConfig&timestamp=${timestamp}&hallId=${hallId}&seanceId=${seanceId}`;

  
  createRequest(requestBodyString, "HALL", updateHtmlHall);
});

function updateHtmlHall(serverResponse) {
  const response = JSON.parse(serverResponse); // объект

  const dataOfTheSelectedSeance = getJSON("data-of-the-selected-seance");

  
  let configSelectedHall;
  let configHalls = getJSON("config-halls"); // получить и преобразовать из JSON в объект
  if (response !== null) {
    console.info("Есть данные в ответе сервера по залу...");
    configSelectedHall = response; 
  } else {
    console.info("В зале нет купленных мест...");
    configSelectedHall = configHalls[dataOfTheSelectedSeance.hallId];
  }

  const buyingInfoSection = document.querySelector(".buying__info");
  buyingInfoSection.innerHTML = "";

  const textHtml = `
  <div class="buying__info-description">
    <h2 class="buying__info-title">"${dataOfTheSelectedSeance.filmName}"</h2>
    <p class="buying__info-start">Начало сеанса: ${dataOfTheSelectedSeance.seanceTime
    } </br>
    ${new Date(+dataOfTheSelectedSeance.seanceTimeStamp).toLocaleDateString(
      "ru-RU",
      { day: "2-digit", month: "long", year: "numeric" }
    )}</p>
    <p class="buying__info-hall">${dataOfTheSelectedSeance.hallName
    }</p>          
  </div>
  <div class="buying__info-hint">
    <p>Тапните дважды,<br>чтобы увеличить</p>
  </div>
`;
  buyingInfoSection.insertAdjacentHTML("beforeend", textHtml);

  const confStep = document.querySelector(".conf-step");
  const textHtmlConf = `
  <div class="conf-step__wrapper">
  ${configSelectedHall}
  </div>
`;

  confStep.innerHTML = "";
  confStep.insertAdjacentHTML("beforeend", textHtmlConf);

  const textHtmlLegend = `
    <div class="conf-step__legend">
    <div class="col">
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_standart"></span> Свободно (<span
          class="conf-step__legend-value price-standart">${dataOfTheSelectedSeance.priceStandart}</span>руб)</p>
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_vip"></span> Свободно VIP (<span
          class="conf-step__legend-value price-vip">${dataOfTheSelectedSeance.priceVip}</span>руб)</p>
    </div>
    <div class="col">
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_taken"></span> Занято</p>
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_selected"></span> Выбрано</p>
    </div>
  </div>
`;
  confStep.insertAdjacentHTML("beforeend", textHtmlLegend);

  const selectedChairs = [];


  const confStepChair = document.querySelectorAll(
    ".conf-step__wrapper .conf-step__chair"
  );

  confStepChair.forEach((element) => {
    element.addEventListener("click", (event) => {

      const elementClickClassList = event.currentTarget.classList;
      if (
        elementClickClassList.contains("conf-step__chair_disabled") ||
        elementClickClassList.contains("conf-step__chair_taken")
      ) {
        return;
      }
      element.classList.toggle("conf-step__chair_selected");
    });
  });


  const acceptinButton = document.querySelector(".acceptin-button");

  acceptinButton?.addEventListener("click", (event) => {
    event.preventDefault();

    const arrayOfRows = Array.from(
      document.querySelectorAll(".conf-step__row")
    );

    for (let indexRow = 0; indexRow < arrayOfRows.length; indexRow++) {
      const elementRow = arrayOfRows[indexRow];
      const arrayOfChairs = Array.from(
        elementRow.querySelectorAll(".conf-step__chair")
      );

      for (
        let indexChair = 0;
        indexChair < arrayOfChairs.length;
        indexChair++
      ) {
        const elementChair = arrayOfChairs[indexChair];
        if (elementChair.classList.contains("conf-step__chair_selected")) {
          const typeChair = elementChair.classList.contains(
            "conf-step__chair_vip"
          )
            ? "vip"
            : "standart";

          selectedChairs.push({
            row: indexRow + 1,
            place: indexChair + 1,
            typeChair: typeChair,
          });
        }
      }
    }

    if (selectedChairs.length) {

      setJSON("data-of-the-selected-chairs", selectedChairs);


      const configSelectedHallHtml = document
        .querySelector(".conf-step__wrapper")
        ?.innerHTML.trim();


      configHalls[dataOfTheSelectedSeance.hallId] = configSelectedHallHtml;
      setJSON("config-halls", configHalls);

      confStepChair.forEach((element) => {
        element.classList.replace("conf-step__chair_selected", "conf-step__chair_taken");
      });

      const configSelectedHallTaken = document.querySelector(".conf-step__wrapper")?.innerHTML.trim();
      const configHallsTaken = getJSON("config-halls");

      configHallsTaken[dataOfTheSelectedSeance.hallId] = configSelectedHallTaken;
      setJSON("pre-config-halls-paid-seats", configHallsTaken);


      const dataOfTheSelectedChairs = getJSON("data-of-the-selected-chairs");

      const arrRowPlace = [];
      let totalCost = 0;

      dataOfTheSelectedChairs.forEach(element => {
        arrRowPlace.push(`${element.row}/${element.place}`);
        totalCost += element.typeChair === "vip" ? +dataOfTheSelectedSeance.priceVip : +dataOfTheSelectedSeance.priceStandart;
      });

      const strRowPlace = arrRowPlace.join(", ");

      const ticketDetails = {
        ...dataOfTheSelectedSeance,
        strRowPlace: strRowPlace,
        hallNameNumber: dataOfTheSelectedSeance.hallName.slice(3).trim(),
        seanceTimeStampInSec: +dataOfTheSelectedSeance.seanceTimeStamp / 1000,
        seanceDay: new Date(+dataOfTheSelectedSeance.seanceTimeStamp).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" }),
        totalCost: totalCost,
      };

      setJSON("ticket-details", ticketDetails);

      window.location.href = "payment.html";
    }
  });
};
