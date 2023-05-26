"use strict";

function setItem(key, value) {
  try {
    return window.sessionStorage.setItem(key, value);
  } catch (e) {
    console.log(e);
  }
}

function getItem(key, value) {
  try {
    return window.sessionStorage.getItem(key);
  } catch (e) {
    console.log(e);
  }
}


function setJSON(key, value) {
  try {
    const json = JSON.stringify(value); 

    setItem(key, json);
  } catch (e) {
    console.error(e);
  }
}


function getJSON(key) {
  try {
    const json = getItem(key);

    return JSON.parse(json);
  } catch (e) {
    console.error(e);
  }
}

function createRequest(requestBodyString, requestSourceString = "", callback, uploadInfoIsNeed = false) {

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "https://jscp-diplom.netoserver.ru/");
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.send(requestBodyString);



  if (uploadInfoIsNeed) {

    xhr.upload.onprogress = function (event) {
      console.log(`Отправка данных... Отправлено ${event.loaded} из ${event.total} байт`);
    };

    xhr.upload.onerror = function () {
      console.log("Произошла ошибка при загрузке данных на сервер!");
    };
  }


  xhr.onload = function () {
    if (xhr.status != 200) {
 
      alert("Ошибка: " + xhr.status);
      return;
    }

    console.log(`${requestSourceString} - статус запроса: ${xhr.status} (${xhr.statusText})`);
    callback(xhr.response);

  };

  xhr.onerror = function () {
    alert("Запрос не удался");
  };

};


