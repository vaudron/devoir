function WebForm_FindFirstFocusableChild(control) {
    if (!control || !(control.tagName)) {
        return null;
    }
    var tagName = control.tagName.toLowerCase();
    if (tagName == "undefined") {
        return null;
    }
    var children = control.childNodes;
    if (children) {
        for (var i = 0; i < children.length; i++) {
            try {
                if (WebForm_CanFocus(children[i])) {
                    return children[i];
                } else {
                    var focused = WebForm_FindFirstFocusableChild(children[i]);
                    if (WebForm_CanFocus(focused)) {
                        return focused;
                    }
                }
            } catch (e) {}
        }
    }
    return null;
}

function WebForm_AutoFocus(focusId) {
    var targetControl;
    if (__nonMSDOMBrowser) {
        targetControl = document.getElementById(focusId);
    } else {
        targetControl = document.all[focusId];
    }
    var focused = targetControl;
    if (targetControl && (!WebForm_CanFocus(targetControl))) {
        focused = WebForm_FindFirstFocusableChild(targetControl);
    }
    if (focused) {
        try {
            focused.focus();
            if (__nonMSDOMBrowser) {
                focused.scrollIntoView(false);
            }
            if (window.__smartNav) {
                window.__smartNav.ae = focused.id;
            }
        } catch (e) {}
    }
}

function WebForm_CanFocus(element) {
    if (!element || !(element.tagName)) return false;
    var tagName = element.tagName.toLowerCase();
    return (!(element.disabled) &&
        (!(element.type) || element.type.toLowerCase() != "hidden") &&
        WebForm_IsFocusableTag(tagName) &&
        WebForm_IsInVisibleContainer(element)
    );
}

function WebForm_IsFocusableTag(tagName) {
    return (tagName == "input" ||
        tagName == "textarea" ||
        tagName == "select" ||
        tagName == "button" ||
        tagName == "a");
}

function WebForm_IsInVisibleContainer(ctrl) {
    var current = ctrl;
    while ((typeof (current) != "undefined") && (current != null)) {
        if (current.disabled ||
            (typeof (current.style) != "undefined" &&
                ((typeof (current.style.display) != "undefined" &&
                        current.style.display == "none") ||
                    (typeof (current.style.visibility) != "undefined" &&
                        current.style.visibility == "hidden")))) {
            return false;
        }
        if (typeof (current.parentNode) != "undefined" &&
            current.parentNode != null &&
            current.parentNode != current &&
            current.parentNode.tagName.toLowerCase() != "body") {
            current = current.parentNode;
        } else {
            return true;
        }
    }
    return true;
}

function WebForm_PostBackOptions(eventTarget, eventArgument, validation, validationGroup, actionUrl, trackFocus, clientSubmit) {
    this.eventTarget = eventTarget;
    this.eventArgument = eventArgument;
    this.validation = validation;
    this.validationGroup = validationGroup;
    this.actionUrl = actionUrl;
    this.trackFocus = trackFocus;
    this.clientSubmit = clientSubmit;
}

function WebForm_DoPostBackWithOptions(options) {
    var validationResult = true;
    if (options.validation) {
        if (typeof (Page_ClientValidate) == 'function') {
            validationResult = Page_ClientValidate(options.validationGroup);
        }
    }
    if (validationResult) {
        if ((typeof (options.actionUrl) != "undefined") && (options.actionUrl != null) && (options.actionUrl.length > 0)) {
            theForm.action = options.actionUrl;
        }
        if (options.trackFocus) {
            var lastFocus = theForm.elements["__LASTFOCUS"];
            if ((typeof (lastFocus) != "undefined") && (lastFocus != null)) {
                if (typeof (document.activeElement) == "undefined") {
                    lastFocus.value = options.eventTarget;
                } else {
                    var active = document.activeElement;
                    if ((typeof (active) != "undefined") && (active != null)) {
                        if ((typeof (active.id) != "undefined") && (active.id != null) && (active.id.length > 0)) {
                            lastFocus.value = active.id;
                        } else if (typeof (active.name) != "undefined") {
                            lastFocus.value = active.name;
                        }
                    }
                }
            }
        }
    }
    if (options.clientSubmit) {
        __doPostBack(options.eventTarget, options.eventArgument);
    }
}
var __pendingCallbacks = new Array();
var __synchronousCallBackIndex = -1;

function WebForm_DoCallback(eventTarget, eventArgument, eventCallback, context, errorCallback, useAsync) {
    var postData = __theFormPostData +
        "__CALLBACKID=" + WebForm_EncodeCallback(eventTarget) +
        "&__CALLBACKPARAM=" + WebForm_EncodeCallback(eventArgument);
    if (theForm["__EVENTVALIDATION"]) {
        postData += "&__EVENTVALIDATION=" + WebForm_EncodeCallback(theForm["__EVENTVALIDATION"].value);
    }
    var xmlRequest, e;
    try {
        xmlRequest = new XMLHttpRequest();
    } catch (e) {
        try {
            xmlRequest = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {}
    }
    var setRequestHeaderMethodExists = true;
    try {
        setRequestHeaderMethodExists = (xmlRequest && xmlRequest.setRequestHeader);
    } catch (e) {}
    var callback = new Object();
    callback.eventCallback = eventCallback;
    callback.context = context;
    callback.errorCallback = errorCallback;
    callback.async = useAsync;
    var callbackIndex = WebForm_FillFirstAvailableSlot(__pendingCallbacks, callback);
    if (!useAsync) {
        if (__synchronousCallBackIndex != -1) {
            __pendingCallbacks[__synchronousCallBackIndex] = null;
        }
        __synchronousCallBackIndex = callbackIndex;
    }
    if (setRequestHeaderMethodExists) {
        xmlRequest.onreadystatechange = WebForm_CallbackComplete;
        callback.xmlRequest = xmlRequest;
        // e.g. http:
        var action = theForm.action || document.location.pathname,
            fragmentIndex = action.indexOf('#');
        if (fragmentIndex !== -1) {
            action = action.substr(0, fragmentIndex);
        }
        if (!__nonMSDOMBrowser) {
            var domain = "";
            var path = action;
            var query = "";
            var queryIndex = action.indexOf('?');
            if (queryIndex !== -1) {
                query = action.substr(queryIndex);
                path = action.substr(0, queryIndex);
            }
            if (path.indexOf("%") === -1) {
                // domain may or may not be present (e.g. action of "foo.aspx" vs "http:
                if (/^https?\:\/\/.*$/gi.test(path)) {
                    var domainPartIndex = path.indexOf("\/\/") + 2;
                    var slashAfterDomain = path.indexOf("/", domainPartIndex);
                    if (slashAfterDomain === -1) {
                        // entire url is the domain (e.g. "http:
                        domain = path;
                        path = "";
                    } else {
                        domain = path.substr(0, slashAfterDomain);
                        path = path.substr(slashAfterDomain);
                    }
                }
                action = domain + encodeURI(path) + query;
            }
        }
        xmlRequest.open("POST", action, true);
        xmlRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
        xmlRequest.send(postData);
        return;
    }
    callback.xmlRequest = new Object();
    var callbackFrameID = "__CALLBACKFRAME" + callbackIndex;
    var xmlRequestFrame = document.frames[callbackFrameID];
    if (!xmlRequestFrame) {
        xmlRequestFrame = document.createElement("IFRAME");
        xmlRequestFrame.width = "1";
        xmlRequestFrame.height = "1";
        xmlRequestFrame.frameBorder = "0";
        xmlRequestFrame.id = callbackFrameID;
        xmlRequestFrame.name = callbackFrameID;
        xmlRequestFrame.style.position = "absolute";
        xmlRequestFrame.style.top = "-100px"
        xmlRequestFrame.style.left = "-100px";
        try {
            if (callBackFrameUrl) {
                xmlRequestFrame.src = callBackFrameUrl;
            }
        } catch (e) {}
        document.body.appendChild(xmlRequestFrame);
    }
    var interval = window.setInterval(function () {
        xmlRequestFrame = document.frames[callbackFrameID];
        if (xmlRequestFrame && xmlRequestFrame.document) {
            window.clearInterval(interval);
            xmlRequestFrame.document.write("");
            xmlRequestFrame.document.close();
            xmlRequestFrame.document.write('<html><body><form method="post"><input type="hidden" name="__CALLBACKLOADSCRIPT" value="t"></form></body></html>');
            xmlRequestFrame.document.close();
            xmlRequestFrame.document.forms[0].action = theForm.action;
            var count = __theFormPostCollection.length;
            var element;
            for (var i = 0; i < count; i++) {
                element = __theFormPostCollection[i];
                if (element) {
                    var fieldElement = xmlRequestFrame.document.createElement("INPUT");
                    fieldElement.type = "hidden";
                    fieldElement.name = element.name;
                    fieldElement.value = element.value;
                    xmlRequestFrame.document.forms[0].appendChild(fieldElement);
                }
            }
            var callbackIdFieldElement = xmlRequestFrame.document.createElement("INPUT");
            callbackIdFieldElement.type = "hidden";
            callbackIdFieldElement.name = "__CALLBACKID";
            callbackIdFieldElement.value = eventTarget;
            xmlRequestFrame.document.forms[0].appendChild(callbackIdFieldElement);
            var callbackParamFieldElement = xmlRequestFrame.document.createElement("INPUT");
            callbackParamFieldElement.type = "hidden";
            callbackParamFieldElement.name = "__CALLBACKPARAM";
            callbackParamFieldElement.value = eventArgument;
            xmlRequestFrame.document.forms[0].appendChild(callbackParamFieldElement);
            if (theForm["__EVENTVALIDATION"]) {
                var callbackValidationFieldElement = xmlRequestFrame.document.createElement("INPUT");
                callbackValidationFieldElement.type = "hidden";
                callbackValidationFieldElement.name = "__EVENTVALIDATION";
                callbackValidationFieldElement.value = theForm["__EVENTVALIDATION"].value;
                xmlRequestFrame.document.forms[0].appendChild(callbackValidationFieldElement);
            }
            var callbackIndexFieldElement = xmlRequestFrame.document.createElement("INPUT");
            callbackIndexFieldElement.type = "hidden";
            callbackIndexFieldElement.name = "__CALLBACKINDEX";
            callbackIndexFieldElement.value = callbackIndex;
            xmlRequestFrame.document.forms[0].appendChild(callbackIndexFieldElement);
            xmlRequestFrame.document.forms[0].submit();
        }
    }, 10);
}

function WebForm_CallbackComplete() {
    for (var i = 0; i < __pendingCallbacks.length; i++) {
        callbackObject = __pendingCallbacks[i];
        if (callbackObject && callbackObject.xmlRequest && (callbackObject.xmlRequest.readyState == 4)) {
            if (!__pendingCallbacks[i].async) {
                __synchronousCallBackIndex = -1;
            }
            __pendingCallbacks[i] = null;
            var callbackFrameID = "__CALLBACKFRAME" + i;
            var xmlRequestFrame = document.getElementById(callbackFrameID);
            if (xmlRequestFrame) {
                xmlRequestFrame.parentNode.removeChild(xmlRequestFrame);
            }
            WebForm_ExecuteCallback(callbackObject);
        }
    }
}

function WebForm_ExecuteCallback(callbackObject) {
    var response = callbackObject.xmlRequest.responseText;
    if (response.charAt(0) == "s") {
        if ((typeof (callbackObject.eventCallback) != "undefined") && (callbackObject.eventCallback != null)) {
            callbackObject.eventCallback(response.substring(1), callbackObject.context);
        }
    } else if (response.charAt(0) == "e") {
        if ((typeof (callbackObject.errorCallback) != "undefined") && (callbackObject.errorCallback != null)) {
            callbackObject.errorCallback(response.substring(1), callbackObject.context);
        }
    } else {
        var separatorIndex = response.indexOf("|");
        if (separatorIndex != -1) {
            var validationFieldLength = parseInt(response.substring(0, separatorIndex));
            if (!isNaN(validationFieldLength)) {
                var validationField = response.substring(separatorIndex + 1, separatorIndex + validationFieldLength + 1);
                if (validationField != "") {
                    var validationFieldElement = theForm["__EVENTVALIDATION"];
                    if (!validationFieldElement) {
                        validationFieldElement = document.createElement("INPUT");
                        validationFieldElement.type = "hidden";
                        validationFieldElement.name = "__EVENTVALIDATION";
                        theForm.appendChild(validationFieldElement);
                    }
                    validationFieldElement.value = validationField;
                }
                if ((typeof (callbackObject.eventCallback) != "undefined") && (callbackObject.eventCallback != null)) {
                    callbackObject.eventCallback(response.substring(separatorIndex + validationFieldLength + 1), callbackObject.context);
                }
            }
        }
    }
}

function WebForm_FillFirstAvailableSlot(array, element) {
    var i;
    for (i = 0; i < array.length; i++) {
        if (!array[i]) break;
    }
    array[i] = element;
    return i;
}
var __nonMSDOMBrowser = (window.navigator.appName.toLowerCase().indexOf('explorer') == -1);
var __theFormPostData = "";
var __theFormPostCollection = new Array();
var __callbackTextTypes = /^(text|password|hidden|search|tel|url|email|number|range|color|datetime|date|month|week|time|datetime-local)$/i;

function WebForm_InitCallback() {
    var formElements = theForm.elements,
        count = formElements.length,
        element;
    for (var i = 0; i < count; i++) {
        element = formElements[i];
        var tagName = element.tagName.toLowerCase();
        if (tagName == "input") {
            var type = element.type;
            if ((__callbackTextTypes.test(type) || ((type == "checkbox" || type == "radio") && element.checked)) && (element.id != "__EVENTVALIDATION")) {
                WebForm_InitCallbackAddField(element.name, element.value);
            }
        } else if (tagName == "select") {
            var selectCount = element.options.length;
            for (var j = 0; j < selectCount; j++) {
                var selectChild = element.options[j];
                if (selectChild.selected == true) {
                    WebForm_InitCallbackAddField(element.name, element.value);
                }
            }
        } else if (tagName == "textarea") {
            WebForm_InitCallbackAddField(element.name, element.value);
        }
    }
}

function WebForm_InitCallbackAddField(name, value) {
    var nameValue = new Object();
    nameValue.name = name;
    nameValue.value = value;
    __theFormPostCollection[__theFormPostCollection.length] = nameValue;
    __theFormPostData += WebForm_EncodeCallback(name) + "=" + WebForm_EncodeCallback(value) + "&";
}

function WebForm_EncodeCallback(parameter) {
    if (encodeURIComponent) {
        return encodeURIComponent(parameter);
    } else {
        return escape(parameter);
    }
}
var __disabledControlArray = new Array();

function WebForm_ReEnableControls() {
    if (typeof (__enabledControlArray) == 'undefined') {
        return false;
    }
    var disabledIndex = 0;
    for (var i = 0; i < __enabledControlArray.length; i++) {
        var c;
        if (__nonMSDOMBrowser) {
            c = document.getElementById(__enabledControlArray[i]);
        } else {
            c = document.all[__enabledControlArray[i]];
        }
        if ((typeof (c) != "undefined") && (c != null) && (c.disabled == true)) {
            c.disabled = false;
            __disabledControlArray[disabledIndex++] = c;
        }
    }
    setTimeout("WebForm_ReDisableControls()", 0);
    return true;
}

function WebForm_ReDisableControls() {
    for (var i = 0; i < __disabledControlArray.length; i++) {
        __disabledControlArray[i].disabled = true;
    }
}

function WebForm_SimulateClick(element, event) {
    var clickEvent;
    if (element) {
        if (element.click) {
            element.click();
        } else {
            clickEvent = document.createEvent("MouseEvents");
            clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            if (!element.dispatchEvent(clickEvent)) {
                return true;
            }
        }
        event.cancelBubble = true;
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        return false;
    }
    return true;
}

function WebForm_FireDefaultButton(event, target) {
    if (event.keyCode == 13) {
        var src = event.srcElement || event.target;
        if (src &&
            ((src.tagName.toLowerCase() == "input") &&
                (src.type.toLowerCase() == "submit" || src.type.toLowerCase() == "button")) ||
            ((src.tagName.toLowerCase() == "a") &&
                (src.href != null) && (src.href != "")) ||
            (src.tagName.toLowerCase() == "textarea")) {
            return true;
        }
        var defaultButton;
        if (__nonMSDOMBrowser) {
            defaultButton = document.getElementById(target);
        } else {
            defaultButton = document.all[target];
        }
        if (defaultButton) {
            return WebForm_SimulateClick(defaultButton, event);
        }
    }
    return true;
}

function WebForm_GetScrollX() {
    if (__nonMSDOMBrowser) {
        return window.pageXOffset;
    } else {
        if (document.documentElement && document.documentElement.scrollLeft) {
            return document.documentElement.scrollLeft;
        } else if (document.body) {
            return document.body.scrollLeft;
        }
    }
    return 0;
}

function WebForm_GetScrollY() {
    if (__nonMSDOMBrowser) {
        return window.pageYOffset;
    } else {
        if (document.documentElement && document.documentElement.scrollTop) {
            return document.documentElement.scrollTop;
        } else if (document.body) {
            return document.body.scrollTop;
        }
    }
    return 0;
}

function WebForm_SaveScrollPositionSubmit() {
    if (__nonMSDOMBrowser) {
        theForm.elements['__SCROLLPOSITIONY'].value = window.pageYOffset;
        theForm.elements['__SCROLLPOSITIONX'].value = window.pageXOffset;
    } else {
        theForm.__SCROLLPOSITIONX.value = WebForm_GetScrollX();
        theForm.__SCROLLPOSITIONY.value = WebForm_GetScrollY();
    }
    if ((typeof (this.oldSubmit) != "undefined") && (this.oldSubmit != null)) {
        return this.oldSubmit();
    }
    return true;
}

function WebForm_SaveScrollPositionOnSubmit() {
    theForm.__SCROLLPOSITIONX.value = WebForm_GetScrollX();
    theForm.__SCROLLPOSITIONY.value = WebForm_GetScrollY();
    if ((typeof (this.oldOnSubmit) != "undefined") && (this.oldOnSubmit != null)) {
        return this.oldOnSubmit();
    }
    return true;
}

function WebForm_RestoreScrollPosition() {
    if (__nonMSDOMBrowser) {
        window.scrollTo(theForm.elements['__SCROLLPOSITIONX'].value, theForm.elements['__SCROLLPOSITIONY'].value);
    } else {
        window.scrollTo(theForm.__SCROLLPOSITIONX.value, theForm.__SCROLLPOSITIONY.value);
    }
    if ((typeof (theForm.oldOnLoad) != "undefined") && (theForm.oldOnLoad != null)) {
        return theForm.oldOnLoad();
    }
    return true;
}

function WebForm_TextBoxKeyHandler(event) {
    if (event.keyCode == 13) {
        var target;
        if (__nonMSDOMBrowser) {
            target = event.target;
        } else {
            target = event.srcElement;
        }
        if ((typeof (target) != "undefined") && (target != null)) {
            if (typeof (target.onchange) != "undefined") {
                target.onchange();
                event.cancelBubble = true;
                if (event.stopPropagation) event.stopPropagation();
                return false;
            }
        }
    }
    return true;
}

function WebForm_TrimString(value) {
    return value.replace(/^\s+|\s+$/g, '')
}

function WebForm_AppendToClassName(element, className) {
    var currentClassName = ' ' + WebForm_TrimString(element.className) + ' ';
    className = WebForm_TrimString(className);
    var index = currentClassName.indexOf(' ' + className + ' ');
    if (index === -1) {
        element.className = (element.className === '') ? className : element.className + ' ' + className;
    }
}

function WebForm_RemoveClassName(element, className) {
    var currentClassName = ' ' + WebForm_TrimString(element.className) + ' ';
    className = WebForm_TrimString(className);
    var index = currentClassName.indexOf(' ' + className + ' ');
    if (index >= 0) {
        element.className = WebForm_TrimString(currentClassName.substring(0, index) + ' ' +
            currentClassName.substring(index + className.length + 1, currentClassName.length));
    }
}

function WebForm_GetElementById(elementId) {
    if (document.getElementById) {
        return document.getElementById(elementId);
    } else if (document.all) {
        return document.all[elementId];
    } else return null;
}

function WebForm_GetElementByTagName(element, tagName) {
    var elements = WebForm_GetElementsByTagName(element, tagName);
    if (elements && elements.length > 0) {
        return elements[0];
    } else return null;
}

function WebForm_GetElementsByTagName(element, tagName) {
    if (element && tagName) {
        if (element.getElementsByTagName) {
            return element.getElementsByTagName(tagName);
        }
        if (element.all && element.all.tags) {
            return element.all.tags(tagName);
        }
    }
    return null;
}

function WebForm_GetElementDir(element) {
    if (element) {
        if (element.dir) {
            return element.dir;
        }
        return WebForm_GetElementDir(element.parentNode);
    }
    return "ltr";
}

function WebForm_GetElementPosition(element) {
    var result = new Object();
    result.x = 0;
    result.y = 0;
    result.width = 0;
    result.height = 0;
    if (element.offsetParent) {
        result.x = element.offsetLeft;
        result.y = element.offsetTop;
        var parent = element.offsetParent;
        while (parent) {
            result.x += parent.offsetLeft;
            result.y += parent.offsetTop;
            var parentTagName = parent.tagName.toLowerCase();
            if (parentTagName != "table" &&
                parentTagName != "body" &&
                parentTagName != "html" &&
                parentTagName != "div" &&
                parent.clientTop &&
                parent.clientLeft) {
                result.x += parent.clientLeft;
                result.y += parent.clientTop;
            }
            parent = parent.offsetParent;
        }
    } else if (element.left && element.top) {
        result.x = element.left;
        result.y = element.top;
    } else {
        if (element.x) {
            result.x = element.x;
        }
        if (element.y) {
            result.y = element.y;
        }
    }
    if (element.offsetWidth && element.offsetHeight) {
        result.width = element.offsetWidth;
        result.height = element.offsetHeight;
    } else if (element.style && element.style.pixelWidth && element.style.pixelHeight) {
        result.width = element.style.pixelWidth;
        result.height = element.style.pixelHeight;
    }
    return result;
}

function WebForm_GetParentByTagName(element, tagName) {
    var parent = element.parentNode;
    var upperTagName = tagName.toUpperCase();
    while (parent && (parent.tagName.toUpperCase() != upperTagName)) {
        parent = parent.parentNode ? parent.parentNode : parent.parentElement;
    }
    return parent;
}

function WebForm_SetElementHeight(element, height) {
    if (element && element.style) {
        element.style.height = height + "px";
    }
}

function WebForm_SetElementWidth(element, width) {
    if (element && element.style) {
        element.style.width = width + "px";
    }
}

function WebForm_SetElementX(element, x) {
    if (element && element.style) {
        element.style.left = x + "px";
    }
}

function WebForm_SetElementY(element, y) {
    if (element && element.style) {
        element.style.top = y + "px";
    }
}
//--------------------------------------------------------------------------------------------------------------------------
CommonFunctions.attachPostMessageEventListener($(window), 'GetWindowLocationUrl', function (data, source) {
    {
        var message = {
            messageName: 'GetWindowLocationUrl',
            origin: window.location.protocol + '//' + window.location.host
        };
        CommonFunctions.makePostMessageCall(source, message);
    }
});
//--------------------------------------------------------------------------------------------------------------------------
$(function () {
    IframeClickEventHelper.registerDocumentClickBubblingOnTop();
});

function DescriptionEditorCKEditor_CheckForm() {
    bOnBeforeUnload = true;
    DescriptionEditorCKEditor_TransferData();
    bOnBeforeUnload = false;
    return true;
}

function DescriptionEditorCKEditor_TransferData() {
    var Text = DescriptionEditorCKEditor_GetEditorTextArea();
    if (!Text) return false;
    Text.value = DescriptionEditorCKEditor_GetEditorContent();
}


function DescriptionEditorCKEditor_CloseIt() {
    if (!(isTextEditorDirty('modifTextarea')))
        return;
    if (bOnBeforeUnload)
        return "Vous tentez de quitter la page. Voulez-vous vraiment continuer ?";
}




function ReplaceURL(url) {
    location.replace(url);
}


function DescriptionEditorCKEditor_GetEditorTextArea() {
    return document.getElementById("modifTextarea");
}

function DescriptionEditorCKEditor_GetEditor() {
    var editor = document.applets["DescriptionEditorCKEditorApplet"];

    if (editor)
        return editor;
    editor = this.document.DescriptionEditorCKEditorObject;
    if (editor)
        return editor;
    editor = window.CKEDITOR.instances.modifTextarea;
    if (editor)
        return editor;
    editor = this.document.DescriptionEditorCKEditor;
    if (editor)
        return editor;
    return DescriptionEditorCKEditor_GetEditorTextArea();
}

function DescriptionEditorCKEditor_GetEditorContent() {
    var editor = DescriptionEditorCKEditor_GetEditor();
    var editorHtml = editor ? editor.getData() : null;
    if (editorHtml == null) {
        return '';
    }
    return editorHtml.replace(/\t/g, ' ').replace(/\n\n/g, '\n');
}

function DescriptionEditorCKEditor_SetContentToEditor(data, editorClientInstanceId) {
    SetHtml(data, editorClientInstanceId);
    SetTextEditorFocus(editorClientInstanceId);
}

function DescriptionEditorCKEditor_CleanupEditor(editorClientInstanceId) {
    CKEDITOR.instances[editorClientInstanceId].document.getBody().setHtml('');
}

function DescriptionEditorCKEditor_SetFocusToEditor() {}

function DescriptionEditorCKEditor_IsEditorEmpty() {
    var txt = DescriptionEditorCKEditor_GetEditor().getData().toLowerCase();
    return ("" == txt) ||
        ("<p>&nbsp;</p>" == txt) ||
        ("<div>&nbsp;</div>" == txt) ||
        ("<p>&#160;</p>" == txt) ||
        ("<p></p>" == txt);
}
//--------------------------------------------------------------------------------------------------------------------------
var CKEditor_Controls = [],
    CKEditor_Init = [];

function CKEditor_TextBoxEncode(d, e) {
    var f;
    if (typeof CKEDITOR == 'undefined' || typeof CKEDITOR.instances[d] == 'undefined') {
        f = document.getElementById(d);
        if (f) f.value = f.value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    } else {
        var g = CKEDITOR.instances[d];
        if (e && (typeof Page_BlockSubmit == 'undefined' || !Page_BlockSubmit)) {
            g.destroy();
            f = document.getElementById(d);
            if (f) f.style.visibility = 'hidden';
        } else g.updateElement();
    }
};
(function () {
    if (typeof CKEDITOR != 'undefined') {
        var d = document.getElementById('modifTextarea');
        if (d) d.style.visibility = 'hidden';
    }
    var e = function () {
        var f = CKEditor_Controls,
            g = CKEditor_Init,
            h = window.pageLoad,
            i = function () {
                for (var j = f.length; j--;) {
                    var k = document.getElementById(f[j]);
                    if (k && k.value && (k.value.indexOf('<') == -1 || k.value.indexOf('>') == -1)) k.value = k.value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
                }
                if (typeof CKEDITOR != 'undefined')
                    for (var j = 0; j < g.length; j++) g[j].call(this);
            };
        window.pageLoad = function (j, k) {
            if (k.get_isPartialLoad()) setTimeout(i, 0);
            if (h && typeof h == 'function') h.call(this, j, k);
        };
        if (typeof Page_ClientValidate == 'function' && typeof CKEDITOR != 'undefined') Page_ClientValidate = CKEDITOR.tools.override(Page_ClientValidate, function (j) {
            return function () {
                for (var k in CKEDITOR.instances) {
                    if (document.getElementById(k)) CKEDITOR.instances[k].updateElement();
                }
                return j.apply(this, arguments);
            };
        });
        setTimeout(i, 0);
    };
    if (typeof Sys != 'undefined' && typeof Sys.Application != 'undefined') Sys.Application.add_load(e);
    if (window.addEventListener) window.addEventListener('load', e, false);
    else if (window.attachEvent) window.attachEvent('onload', e);

    CKEditor_Controls.push('modifTextarea');
    CKEditor_Init.push(function () {
        if (typeof CKEDITOR.instances['modifTextarea'] != 'undefined' || !document.getElementById('modifTextarea')) return;
        CKEDITOR.replace('modifTextarea', {
            "entities": false,
            "entities_additional": "",
            "entities_greek": false,
            "extraPlugins": "dynamicinsertmenu,ckeditor_wiris,itslimageprop,previewmedia,longtouchcontextmenu,editextension,collapsetoolbar,fakemedia",
            "font_names": "Arial;Comic Sans MS;Courier New;Helvetica;Tahoma;Times New Roman;Verdana;Palatino Linotype",
            "fontSize_sizes": "smaller/smaller;larger/larger;xx-small/xx-small;x-small/x-small;small/small;medium/medium;large/large;x-large/x-large;xx-large/xx-large",
            "height": "300",
            "htmlEncodeOutput": true,
            "language": "fr-fr",
            "removePlugins": "image,forms",
            "smiley_columns": 14,
            "smiley_descriptions": ["smile", "sad", "wink", "big smile", "confused", "cheeky", "embaressed", "surprised", "speechless", "angry", "angel", "cool", "devil", "cry", "lightbulb", "thumbs down", "thumbs up", "broken heart", "kiss", "envelope", "airplane", "alarm", "apple", "banana", "basketball", "bookmark", "boxing gloves blue", "boxing gloves red", "bull", "candle", "certificate", "check", "chest", "clock", "cloud", "cloud dark", "cow", "delete", "die", "die gold", "dog", "error", "extinguisher", "eye", "fish", "flashlight", "flower blue", "flower red", "flower white", "flower yellow", "goblet bronze", "goblet gold", "goblet silver", "guitar", "hand red card", "hand yellow card", "hat green", "hat red", "heart", "icecream", "lemon", "lifebelt", "lightbulb", "magic-wand", "medal", "moon", "palm", "pig", "pin green", "pin red", "pineapple", "rubberstamp", "ship", "snowflake", "soccer ball", "spider", "spider", "star blue", "star green", "star red", "star yellow", "step", "stop", "stopwatch", "sun", "sun and cloud", "target", "target", "trafficlight green", "trafficlight red", "tree", "view", "violin"],
            "smiley_images": ["regular_smile.gif", "sad_smile.gif", "wink_smile.gif", "teeth_smile.gif", "confused_smile.gif", "tounge_smile.gif", "embaressed_smile.gif", "omg_smile.gif", "whatchutalkingabout_smile.gif", "angry_smile.gif", "angel_smile.gif", "shades_smile.gif", "devil_smile.gif", "cry_smile.gif", "lightbulb.gif", "thumbs_down.gif", "thumbs_up.gif", "broken_heart.gif", "kiss.gif", "envelope.gif", "airplane.png", "alarm.png", "apple.png", "banana.png", "basketball.png", "bookmark.png", "boxing_gloves_blue.png", "boxing_gloves_red.png", "bull.png", "candle.png", "certificate.png", "check2.png", "chest.png", "clock.png", "cloud.png", "cloud_dark.png", "cow.png", "delete2.png", "die.png", "die_gold.png", "dog.png", "error.png", "extinguisher.png", "eye.png", "fish.png", "flashlight.png", "flower_blue.png", "flower_red.png", "flower_white.png", "flower_yellow.png", "goblet_bronze.png", "goblet_gold.png", "goblet_silver.png", "guitar.png", "hand_red_card.png", "hand_yellow_card.png", "hat_green.png", "hat_red.png", "heart.png", "icecream.png", "lemon.png", "lifebelt.png", "lightbulb.png", "magic-wand.png", "medal.png", "moon.png", "palm.png", "pig.png", "pin_green.png", "pin_red.png", "pineapple.png", "rubberstamp.png", "ship2.png", "snowflake.png", "soccer_ball.png", "spider.png", "spider2.png", "star_blue.png", "star_green.png", "star_red.png", "star_yellow.png", "step.png", "stop.png", "stopwatch.png", "sun.png", "sun_and_cloud.png", "target2.png", "target3.png", "trafficlight_green.png", "trafficlight_red.png", "tree.png", "view.png", "violin.png"],
            "smiley_path": "/ui/controls/editor/FCK/editor/images/smiley/itslearning/",
            "toolbar": [["Font", "FontSize", ""], ["Bold", "Italic", "Underline", ""], ["Undo", "Redo", "-", "Cut", "Copy", "Paste", "PasteText", "PasteFromWord", ""], ["dynamicinsertmenu", ""], ["Link", ""], ["TextColor", "BGColor", "SpecialChar", "-", "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock", ""], ["Subscript", "Superscript", "-", "Outdent", "Indent", "-", "NumberedList", "BulletedList", "-", "Table", ""], ["Source", ""], ["ckeditor_wiris_formulaEditor", ""], ["Smiley", ""], ["Maximize", ""], ["collapsetoolbar"]],
            "toolbarCanCollapse": false,
            "uiColor": "#ffffff",
            "allowedContent": true,
            "dynamicinsertmenu": {
                "Items": [{
                    "DialogSrc": "/FileExplorer/ViewFiles.aspx?Function=1",
                    "Command": null,
                    "IsEditorDialogTransparent": false,
                    "DialogHeight": 670,
                    "DialogWidth": 615,
                    "Text": "Image",
                    "EditText": null,
                    "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/image16.png",
                    "IframeCssClass": null,
                    "Id": "itslimage"
            }, {
                    "DialogSrc": "/Editor/InsertRecording.aspx?PageTab=0\u0026RecordingType=1",
                    "Command": null,
                    "IsEditorDialogTransparent": false,
                    "DialogHeight": 665,
                    "DialogWidth": 600,
                    "Text": "Enregistrement vidéo",
                    "EditText": null,
                    "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/videorecorder16.png",
                    "IframeCssClass": null,
                    "Id": "itslvideorecorder"
            }, {
                    "DialogSrc": "/Editor/InsertRecording.aspx?PageTab=0\u0026RecordingType=2",
                    "Command": null,
                    "IsEditorDialogTransparent": false,
                    "DialogHeight": 530,
                    "DialogWidth": 600,
                    "Text": "Enregistrement audio",
                    "EditText": null,
                    "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/audiorecorder16.png",
                    "IframeCssClass": null,
                    "Id": "itslaudiorecorder"
            }, {
                    "DialogSrc": "/Editor/treelink.aspx",
                    "Command": null,
                    "IsEditorDialogTransparent": false,
                    "DialogHeight": 320,
                    "DialogWidth": 600,
                    "Text": "Lien vers l\u0027arborescence",
                    "EditText": null,
                    "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/treelink16.png",
                    "IframeCssClass": null,
                    "Id": "treelink"
            }, {
                    "DialogSrc": "/FileExplorer/BrowseFiles.aspx?Type=2\u0026Function=2\u0026PopUp=1",
                    "Command": null,
                    "IsEditorDialogTransparent": false,
                    "DialogHeight": 570,
                    "DialogWidth": 750,
                    "Text": "Fichier du répertoire \u0027Vos fichiers Web\u0027",
                    "EditText": null,
                    "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/element_resource16.png",
                    "IframeCssClass": null,
                    "Id": "itslfile"
            }, {
                    "DialogSrc": "/Editor/Web2Content.aspx",
                    "Command": null,
                    "IsEditorDialogTransparent": false,
                    "DialogHeight": 660,
                    "DialogWidth": 760,
                    "Text": "Contenu Web 2.0",
                    "EditText": null,
                    "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/web2content16.png",
                    "IframeCssClass": null,
                    "Id": "web2cont"
            }, {
                    "DialogSrc": "/Editor/Extensions/BrowseExtensions.aspx?ItslExtensionPlacementArea=1\u0026DisableExpandInLibrary=False",
                    "Command": null,
                    "IsEditorDialogTransparent": true,
                    "DialogHeight": 595,
                    "DialogWidth": 892,
                    "Text": "Parcourir la bibliothèque d\u0027application",
                    "EditText": null,
                    "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/tools16.png",
                    "IframeCssClass": null,
                    "Id": "itslbrowseextensions"
            }],
                "LabelText": "Insérer",
                "TitleText": "Insérer du contenu",
                "Id": "dynamicinsertmenu"
            },
            "fakemedia": {
                "PluginSettings": {
                    "supportedVideoFormats": ["mp4", "m4v", "ogv", "webm", "webmv", "flv"],
                    "mediaContentAttribute": "mediacontent",
                    "mediaTypes": {
                        "auto": 0,
                        "forceAudio": 1,
                        "forceVideo": 2
                    },
                    "dataMemberNames": {
                        "mediaType": "mediaType",
                        "fileName": "fileName"
                    },
                    "cssClasses": {
                        "audio": "cke_fakemedia_audio",
                        "video": "cke_fakemedia_video"
                    }
                },
                "Id": "fakemedia"
            },
            "previewmedia": {
                "ExtraSettings": {
                    "mediaContentAttribute": "mediacontent",
                    "cssClasses": {
                        "fakeAudio": "cke_fakemedia_audio",
                        "fakeVideo": "cke_fakemedia_video"
                    }
                },
                "DialogSrc": "/FileExplorer/PreviewMediaFile.aspx?ViewOnly=True\u0026Type=2\u0026File={filePath}\u0026FileName={fileName}\u0026PlayerMediaType={playerMediaType}",
                "Command": null,
                "IsEditorDialogTransparent": false,
                "DialogHeight": 470,
                "DialogWidth": 550,
                "Text": "Prévisualisation",
                "EditText": "Prévisualisation",
                "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/url_preview16.png",
                "IframeCssClass": null,
                "Id": "previewmedia"
            },
            "collapsetoolbar": {
                "DialogSrc": null,
                "Command": null,
                "IsEditorDialogTransparent": false,
                "DialogHeight": 0,
                "DialogWidth": 0,
                "Text": null,
                "EditText": null,
                "IconSrc": null,
                "IframeCssClass": null,
                "Id": "collapsetoolbar"
            },
            "itslimageprop": {
                "DialogSrc": "/FileExplorer/InsertImageUrl.aspx?Function=1\u0026imageurl={src}\u0026alt={alt}\u0026border={border}\u0026align={align}\u0026className={class}\u0026width={width}\u0026height={height}",
                "Command": null,
                "IsEditorDialogTransparent": false,
                "DialogHeight": 355,
                "DialogWidth": 400,
                "Text": "Propriétés de l\u0027image",
                "EditText": "Propriétés de l\u0027image",
                "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/image16.png",
                "IframeCssClass": null,
                "Id": "itslimageprop"
            },
            "ckeditor_wiris": {
                "DialogSrc": "https://leducdenormandie.itslearning.com/Services/CommonService.asmx/MeasureKpi?measureSection=kpiMeasureSection\u0026measurement=kpiMeasurement\u0026measureContext=kpiMeasureContext",
                "Command": null,
                "IsEditorDialogTransparent": false,
                "DialogHeight": 0,
                "DialogWidth": 0,
                "Text": "Éditeur WIRIS",
                "EditText": "Modifier l\u0027équation",
                "IconSrc": null,
                "IframeCssClass": null,
                "Id": "ckeditor_wiris"
            },
            "editextension": {
                "DialogSrc": null,
                "Command": "window.open( \u0027https://leducdenormandie.itslearning.com/editor/PluginHandler.aspx?ExtensionId=-1\u0026EditorClientInstanceId={editorId}\u0027, \u0027__extensionPopup_-1\u0027, \u0027resizable=yes,scrollbars=yes,status=yes\u0027); ",
                "IsEditorDialogTransparent": false,
                "DialogHeight": 0,
                "DialogWidth": 0,
                "Text": "Remplacer un plug-in",
                "EditText": "Modifier un plug-in",
                "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/tools16.png",
                "IframeCssClass": null,
                "Id": "editextension"
            },
            "title": false,
            "longtouchcontextmenu": {
                "Delay": 1000,
                "DistanceThreshold": 5,
                "Id": "longtouchcontextmenu"
            },
            "entities_processNumerical": false
        });

    });
})();