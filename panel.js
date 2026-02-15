const selTags = document.getElementById("tag");
const selPlat = document.getElementById("piattaforme");

const arrTags = sessionStorage.getItem("tags").split(",");
const arrPlat = sessionStorage.getItem("platform").split(",");

arrTags.forEach((tag) => {
  selTags.innerHTML += `<input type="checkbox" id="${tag}" name="tag" value="${tag}">\n<label for="${tag}">${tag}</label><br>`;
});

arrPlat.forEach((plat) => {
  selPlat.innerHTML += `<input type="checkbox" id="${plat}" name="piattaforme" value="${plat}">\n<label for="${plat}">${plat}</label><br>`;
});

function parse(sender) {
  event.preventDefault();
  const form = sender.closest("form");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const formData = new FormData(form);
  const textarea = document.getElementById("JSON");
  const json = {};
  const tagCheckboxes = form.querySelectorAll('input[name="tag"]:checked');
  const tagArray = Array.from(tagCheckboxes).map((cb) => cb.value);
  const platCheckboxes = form.querySelectorAll(
    'input[name="piattaforme"]:checked',
  );
  const platArray = Array.from(platCheckboxes).map((cb) => cb.value);
  for (let [key, value] of formData.entries()) {
    switch (key) {
      case "tag":
      case "piattaforme":
        json[key] = [];
        break;
      case "crossPlay":
        break;
      case "imgPath":
        value = "img/" + value + ".jpeg";
        json[key] = value;
        break;
      default:
        json[key] = value;
        break;
    }
  }
  json["tag"] = tagArray;
  json["piattaforme"] = platArray;
  json["crossPlay"] = formData.has("crossPlay");
  delete json.JSON;
  textarea.value = JSON.stringify(json, null, 2);
}
