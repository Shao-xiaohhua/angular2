

function CertFounder() {
	
	var self = this;

	var running = false;

	this.found = false;
	
	this.onerror = function (err) {
		console.log('onError', err);
	}

	this.onfound = function (cn) {
		console.log('onFound', cn);
	}
	
	this.onlost = function () {
		console.log('onLost');
	}

	this.setConfig = function (){
		try {
			TCA.config(config);
  	} catch(e) {
  		if (e instanceof TCACErr) {
				self.onerror('没有检测到证书助手，请下载并安装证书助手！');
  			//window.location.href="download/天诚安信数字证书助手-3.2.0.2-https.exe";
  		} else {
  			alert("Here is Error !!!");
  		}
  	}
	}

	var config = {
		"license" : "MIIFgAYJKoZIhvcNAQcCoIIFcTCCBW0CAQExDjAMBggqgRzPVQGDEQUAMIHGBgkqhkiG9w0BBwGggbgEgbV7Iklzc3VlciI6IigoKC4qT1U95rWL6K+V6YOo6K+V55SoLiopfCguKk895aSp6K+a5a6J5L+h6K+V55SoLiopKXsyfSkiLCJ2ZXJzaW9uIjoiMS4wLjAuMSIsInNvZnRWZXJzaW9uIjoiMy4xLjAuMCIsIm5vdGFmdGVyIjoiMjAxNi0wNy0xNSIsIm5vdGJlZm9yZSI6IjIwMTYtMDQtMTUiLCJub0FsZXJ0IjoidHJ1ZSJ9oIIDRDCCA0AwggLloAMCAQICFF8lnNrMgrt+8wWzAHuLjsm9+bXyMAwGCCqBHM9VAYN1BQAwVTEmMCQGA1UEAwwd5aSp6K+a5a6J5L+h5rWL6K+VU00y55So5oi3Q0ExDjAMBgNVBAsMBVRPUENBMQ4wDAYDVQQKDAVUT1BDQTELMAkGA1UEBhMCQ04wHhcNMTQwOTI2MDc0NjA4WhcNMTUwOTI2MDc0NjA4WjAxMRgwFgYDVQQDDA9TaWduRVNBMjAxNDA5MjcxFTATBgNVBAoMDOWkqeivmuWuieS/oTBZMBMGByqGSM49AgEGCCqBHM9VAYItA0IABJYWeFLmIy9mTud+ai0LBeLoxhgnO6HcQGbsQhl4fveJzoVx0Cyzt/xvWY5y7l3qAwd59AbI+Im6Ftl/wAOShYmjggGzMIIBrzAJBgNVHRMEAjAAMAsGA1UdDwQEAwIGwDCBigYIKwYBBQUHAQEEfjB8MHoGCCsGAQUFBzAChm5odHRwOi8vWW91cl9TZXJ2ZXJfTmFtZTpQb3J0L1RvcENBL3VzZXJFbnJvbGwvY2FDZXJ0P2NlcnRTZXJpYWxOdW1iZXI9NUE0N0VDRjEwNTgwNEE1QzZBNUIyMjkyOUI3NURGMERGQkMwRDc5NjBXBgNVHS4EUDBOMEygSqBIhkZQb3J0L1RvcENBL3B1YmxpYy9pdHJ1c2NybD9DQT01QTQ3RUNGMTA1ODA0QTVDNkE1QjIyOTI5Qjc1REYwREZCQzBENzk2MG8GA1UdHwRoMGYwZKBioGCGXmh0dHA6Ly9Zb3VyX1NlcnZlcl9OYW1lOlBvcnQvVG9wQ0EvcHVibGljL2l0cnVzY3JsP0NBPTVBNDdFQ0YxMDU4MDRBNUM2QTVCMjI5MjlCNzVERjBERkJDMEQ3OTYwHwYDVR0jBBgwFoAUPYnGR8txhbDZO9ZIsInZ5/7v2tkwHQYDVR0OBBYEFEs77X+HgoaHoBKSsS7mACXYtREAMAwGCCqBHM9VAYN1BQADRwAwRAIgvbTXF8yNH5jsbG6r7XL5LEupJd8l8x9akz8rhO5XYYICIOg+hxn5F44N5+waqG+1Dbs6m9xiID83VkHnmptdMoR7MYIBRTCCAUECAQEwbTBVMSYwJAYDVQQDDB3lpKnor5rlronkv6HmtYvor5VTTTLnlKjmiLdDQTEOMAwGA1UECwwFVE9QQ0ExDjAMBgNVBAoMBVRPUENBMQswCQYDVQQGEwJDTgIUXyWc2syCu37zBbMAe4uOyb35tfIwDAYIKoEcz1UBgxEFAKBpMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTE1MDQxNTE3MzQyN1owLwYJKoZIhvcNAQkEMSIEIHWHtIXceR0KWi74nyqv5I7tAX2J2gtCTOIMUUapaM26MAwGCCqBHM9VAYItBQAERjBEAiD5czyu+4Y09jU31hB0xTDKCmnF+QWTz9cRmc/8elx5SAIgZwHPxczQXYxgGRp+pBqjrC1JxKKxb6Z6KF0aiuWp0OI=",
		exportKeyAble : false,
		disableExeUrl : true
  };
	if (TCAConfigCount == 0) {
		this.setConfig();
		TCAConfigCount = 1; //index.html 中有全局变量
	}

	this.start = function () {
		running = true;
		setTimeout(run, 1000);
	}
	
	this.stop = function () {
		running = false;
	}

	var run = function () {
		if (!running) {
			return;
		}
		var certs = CertStore.listAllCerts();
		if (certs.size() > 0 && !self.found) {
			var cert = certs.get(0);
			var cn = getCNFromSubject(cert);
			cn = 'shiliang';
			self.found = true;
			self.onfound(cn);
		} else if (certs.size() == 0 && self.found) {
			self.found = false;
			self.onlost();
		}
		setTimeout(run, 1000);
	}
	
	function getCNFromSubject(cert) {
		  try {
		    var t = cert.subject().match(/(S(?!N)|L|O(?!U)|OU|SN|CN|E)=([^=]+)(?=, |$)/g);
		    for (var i = 0; i < t.length; i++) {
		      if (t[i].indexOf("CN=") === 0)
		        return t[i].substr(3, t[i].length);
		      }
		      return null;
		  } catch (e) {
		    if (e instanceof TCACErr) {
		      self.onerror(e.toStr());
		    } else {
		      alert("Here is Error !!!");
		    }
		  }
		}
}
