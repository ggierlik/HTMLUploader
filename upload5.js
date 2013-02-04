function init() {
	$("browse-button-wrapper").onclick = function () {
		$("browse-button").click();
	}

	var browseButton = document.getElementById("browse-button"),
		dropArea = document.getElementById("drop-area"),
		fileList = document.getElementById("file-list"),
		uploadButton = document.getElementById("upload-button");

	//based on http://robertnyman.com/2010/12/16/utilizing-the-html5-file-api-to-choose-upload-preview-and-see-progress-for-multiple-files/
	browseButton.addEventListener("change", function () {
		traverseFiles(this.files);
	}, false);

	dropArea.addEventListener("dragleave", function (evt) {
		var target = evt.target;

		if (target && target === dropArea) {
			this.className = "";
		}
		evt.preventDefault();
		evt.stopPropagation();
	}, false);

	dropArea.addEventListener("dragenter", function (evt) {
		this.className = "over";
		evt.preventDefault();
		evt.stopPropagation();
	}, false);

	dropArea.addEventListener("dragover", function (evt) {
		evt.preventDefault();
		evt.stopPropagation();
	}, false);

	dropArea.addEventListener("drop", function (evt) {
		traverseFiles(evt.dataTransfer.files);
		this.className = "";
		evt.preventDefault();
		evt.stopPropagation();
	}, false);

	uploadButton.addEventListener("click", function () {
		uploadFiles();
	});
}

/*
function addFileInfo(file) {
	// Present file info and append it to the list of files
	fileInfo = "<div><strong>Name:</strong> " + file.name + "</div>";
	fileInfo += "<div><strong>Size:</strong> " + parseInt(file.size / 1024, 10) + " kb</div>";
	fileInfo += "<div><strong>Type:</strong> " + file.type + "</div>";

	file.sizeKb = parseInt(file.size / 1024, 10);
	var item = new Template("<li>#{name} #{sizeKb}</li>");
	var itemHTML = item.evaluate(file);
	$("file-list").insert(itemHTML);
}
*/

function showPanel() {
	var list = $("file-list");
	list.show();
	list.setStyle({"border": "1px dotted #eee"});

	var panel = $("panel");
	panel.show();
	window.title = "Ready to upload...";

	/*var btn = $("upload-button");
	btn.disabled = false;
	btn.setStyle({color: "white", cursor: "pointer", backgroundColor: "#0063DC"});*/
}

function traverseFiles (files) {
	if (typeof files !== "undefined") {
		var i = 0,
			l = files.length;

		for (; i < l; i++) {
			//uploadFile(files[i]);
			//addFileInfo(files[i]);
			processFile(files[i]);
		}
		showPanel();
	}
	else {
		//fileList.innerHTML = "No support for the File API in this web browser";
	}
}

var imageCounter = 1;

function clipPhoto(n) {
	return false;
	var H_SIZE = 180;
	var V_SIZE = 180;
	var imgId = "IMG_" + n;
	var img = $(imgId);
	console.log("%s %d %d", imgId, img.width, img.height);
	if (img) {
		if (img.width > H_SIZE) {
			img.setStyle({"margin-left": -((img.width - SIZE) / 2) + "px"});
		}
		if (img.height > V_SIZE) {
			img.setStyle({"margin-top": -((img.height - SIZE) / 2) + "px"});
		}
	}
};

var imageBoxTemplate = new Template("<div class='photoBox' id='BOX_#{n}'><div class='imageContainer'><img src='#{src}' alt='#{name}' class='photo' id='IMG_#{n}' name='#{name}' type='#{type}' onclick='toggleSelect(this);'></div><div class='name'>#{name}</div><div class='editbox'><textarea id='DESC_#{n}' name='desc_#{n}' type='text' placeholder='Add a description...' onfocus='showBox1(this)' onblur='hideBox1(this);'></textarea></div></div>");

function addPhotoBox(file, base64encoded) {
	//<span id='label_#{n}'>Add description&hellip;</span>

	file.src = base64encoded;
	file.n = imageCounter++;

	var boxHTML = imageBoxTemplate.evaluate(file);
	$("file-list").insert(boxHTML);
	clipPhoto(file.n);

	/*var imgBox = new Element("div", {"class": "photoBox"});
	imgBox.name = file.name;
	imgBox.type = file.type;

	var preview = new Element("image").addClassName("photo");
	preview.src = base64encoded;

	$("file-list").insert(imgBox.update(preview));//.addClassName("photo")*/
}

function processFile(file) {
	if(!( /image/i ).test(file.type)) {
		alert("File "+ file.name +" is not an image.");
		return false;
	}

	var reader = new FileReader();
	reader.readAsArrayBuffer(file);

	reader.onload = function (event) {
		// blob stuff
		var blob = new Blob([event.target.result]); // create blob...
		window.URL = window.URL || window.webkitURL;
		var blobURL = window.URL.createObjectURL(blob); // and get it's URL

		// helper Image object
		var image = new Element("image");
		image.src = blobURL;

		//preview.appendChild(image); // preview commented out, I am using the canvas instead
		image.onload = function () {
			// have to wait till it's loaded
			var base64encoded = resizeMe(image); // send it to canvas
			/*var newinput = document.createElement("input");
			newinput.type = 'hidden'
			newinput.name = 'images[]'
			newinput.value = resized; // put result from canvas into new hidden input
			form.appendChild(newinput);*/

			addPhotoBox(file, base64encoded);
		}
	};
}

function resizeMe(img) {
	var MAX_WIDTH = 1200;
	var MAX_HEIGHT = 1600;
	
	var canvas = document.createElement('canvas');

	var width = img.width;
	var height = img.height;

	// calculate the width and height, constraining the proportions
	if (width > height) {
		if (width > MAX_WIDTH) {
			//height *= max_width / width;
			height = Math.round(height *= MAX_WIDTH / width);
			width = MAX_WIDTH;
		}
	} else {
		if (height > MAX_HEIGHT) {
			//width *= max_height / height;
			width = Math.round(width *= MAX_HEIGHT / height);
			height = MAX_HEIGHT;
		}
	}

	// resize the canvas and draw the image data into it
	canvas.width = width;
	canvas.height = height;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0, width, height);

	$("preview").update(canvas); // do the actual resized preview

	return canvas.toDataURL("image/jpeg", 0.9); // get the data from canvas as 70% JPG (can be also PNG, etc.)
}

/*
function uploadFile(file) {
	//return false;
	// Uploading - for Firefox, Google Chrome and Safari
	xhr = new XMLHttpRequest();
	xhr.open("POST", "http://waynupload/waynupload.html?type=&member_key=1977103&token=9B8A1191A6887F9AC367C61AF2900F2C&domain=www.wayn.trunk&return_url=http%3A%2F%2Fwww%2Ewayn%2Ecom%2Fwaynphotos%2Ehtml%3Fwci%3Dupload&stats_key=", true);

// Set appropriate headers
	xhr.setRequestHeader("Content-Type", "multipart/form-data");
	xhr.setRequestHeader("X-File-Name", file.name);
	xhr.setRequestHeader("X-File-Size", file.size);
	xhr.setRequestHeader("X-File-Type", file.type);

// Send the file (doh)
	xhr.send(file.src);
}
*/

/*
function uploadFiles() {
	$("file-list").select("img").each(function (i) {
		uploadFile(i);
	});
}
*/
function createInputElement(name, value, type) {
	var input = new Element("input");
	input.type = type || "hidden";
	input.name = name;
	input.value = value;

	return input;
}

function uploadFiles() {
	var form = new Element("form");
	form.method = "POST";
	//form.target = "upload-result";
	//form.enctype = "multipart/form-data";
	form.action = "http://waynupload/waynupload.html?type=&member_key=1977103&token=9B8A1191A6887F9AC367C61AF2900F2C&domain=www.wayn.beta&stats_key=html5&swfupload=10";
	var n = 1;

	var photos = [];

	$("file-list").select("img").each(function (i) {
		var input;
		input = createInputElement("FILE" + n, i.src);
		form.insert(input);

		input = createInputElement("FILENAME" + n, i.name);
		form.insert(input);

		var notes = $(i.id.replace("IMG_", "DESC_"));
		if (notes && !notes.value.blank() && !notes.value.startsWith("Add description")) {
			input = createInputElement("NOTES" + n, notes.value);
			form.insert(input);
		}

		photos.push(n);
		n++;
	});

	form.action += "&photos=" + photos.join(",");
	var albumKey = parseInt($("albums-list").value, 10);
	if (Object.isNumber(albumKey) && albumKey > 0) {
		form.action += "&album_key=" + albumKey;
	}

	form.submit();
}

document.observe("dom:loaded", function () {
	init();
});

function showBox(box) {
	var label = box.down();
	label.hide();
	var input = label.next();
	if (!label.innerHTML.startsWith("Add description")) {
		input.value = label.innerHTML;
	}
	input.show();
	input.focus();
}

function hideBox(box) {
	var label = box.previous();
	/*
	 if (!box.value.blank()) {
	 label.update(box.value);
	 }
	 */
//	box.hide();
	label.show();
}

function showBox1(box) {
	box.addClassName("box");
}

function hideBox1(box) {
	var label = box.previous();
	/*
	 if (!box.value.blank()) {
	 label.update(box.value);
	 }

	box.hide();
	label.show();
	 */
	box.removeClassName("box");
}

function toggleSelect(img) {
	img = Element.extend(img);
	img.toggleClassName("selected");
}

function showAlbums() {
	var album = $("albums-list");
	if (album) {
		album.show();
	}
}

function hideAlbums(list) {
	list = Element.extend(list);
	list.hide();
}

function removeSelected() {
	var list = $("file-list");
	var photosToRemove = list.select("img.selected");
	photosToRemove.each(function (i) {
		var box = $(i.id.replace("IMG_", "BOX_"));
		if (box) {
			box.remove();
		}
	});
}

function rotateSelected() {
	var list = $("file-list");
	var photosToRotate = list.select("img.selected");
	photosToRotate.each(function (i) {
		i.src = rotateImg(i);
	});
}

function rotateImg(imgToRotate) {
	var img = new Element("image");
	img.src = imgToRotate.src;
	//img.setStyle({"-moz-transform": "rotate(90deg)", "-webkit-transform": "rotate(90deg)"});

	$("preview").update(img);
	var canvas = document.createElement('canvas');

	console.log(img);

	canvas.width = img.height;
	canvas.height = img.width;

//	canvas.width = img.width;
//	canvas.height = img.height;
//	var s = Math.max(img.width, img.height);
//	canvas.width = s;
//	canvas.height = s;
//	var s2 = s / 2;

	var w2 = img.width / 2;
	var h2 = img.height / 2;

	var ctx = canvas.getContext("2d");
	//ctx.drawImage(img, 0, 0, img.width, img.height);
//	ctx.translate(s2, s2);
	ctx.translate(h2, w2);
	ctx.rotate(Math.PI/2);
//	ctx.translate(-s2, -s2);
	ctx.translate(-h2, -w2);

//	ctx.drawImage(img, 0, 0, s, s);
//	ctx.clip(0, 0, img.height, img.width);
	ctx.drawImage(img, 0, 0, img.width, img.height);


	$("preview").update(canvas); // do the actual resized preview

	return canvas.toDataURL("image/jpeg", 0.9); // get the data from canvas as 70% JPG (can be also PNG, etc.)
}
