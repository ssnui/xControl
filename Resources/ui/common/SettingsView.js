//Settings View Component Constructor
function SettingsWindow(props,listView) {
	var forms = require('ui/common/forms');
	var currentConnType = Ti.App.Properties.getString('network_type');
	var networkBtnTitle = "";
	if(currentConnType == 'Remote'){
		networkBtnTitle = "Remote Connection";			
	}else{
		networkBtnTitle = "Local Connection";
	}
	var connectionData = [
			{ title:networkBtnTitle, type:'button', id:'changeNetwork'},
	        { title:'Server', type:'text', id:'ipaddress' },
	        { title:'Method', type:'text', id:'method' },
	        { title:'Port', type:'number', id:'port' },
	        { title:'Username', type:'text', id:'username' },
	        { title:'Password', type:'password', id:'password' },
	        { title:'Add/Remove Devices', type:'button', id:'addRemoveDevices' },
	        { title:'Close', type:'submit', id:'close' }
       	];
	var self = Ti.UI.createView(props.settingsViewProps.formProps);
		
	var form = forms.createForm({
	        style: forms.STYLE_LABEL,
	        fields: connectionData,
	        props: props.settingsViewProps
	});
	
	form.addEventListener('close', function(e) {
        Ti.API.debug(e);
		saveConnectionInfo(e.values);
		listView.remove(self);
		Ti.App.Properties.setString('hasRunBefore', true);
		listView.fireEvent('myFocus',{ 'scroller': e.source });
	});
	
	form.addEventListener('changeNetwork', function(e) {
		var currentType = Ti.App.Properties.getString('network_type');
		//Toggle the network Type todo:There's probably a more concise way to do this
		if(currentType == "Remote"){
			Ti.App.Properties.setString('network_type',"Local");
			form.fieldRefs.changeNetwork.title = "Local Connection";	
		}else{
			Ti.App.Properties.setString('network_type',"Remote");
			form.fieldRefs.changeNetwork.title = "Remote Connection";	
		}
		getConnectionInfo(Ti.App.Properties.getString('network_type'));
	});
	
	form.addEventListener('addRemoveDevices', function(e) {
		saveConnectionInfo(e.values);
		var addRemoveDevices = require('ui/common/addRemoveDevices');
	
		var win = new addRemoveDevices();
		if (Ti.Platform.osname === 'android') {
			win.open({fullscreen:true});
		}else{
			win.open({modal:true});	
		}	
	});
	
	self.add(form);
		
	function getConnectionInfo(connType){
		var connectionInfo = {};
		//connType is Remote or Local
		connectionInfo = JSON.parse(Titanium.App.Properties.getString('conn_' + connType));
		
		if (!connectionInfo){
			connectionInfo = {
				'ipaddress' : "",
				'method' : "",
				'port' : "",
				'username' : "",
				'password' : ""
			}
		}
		//todo: do we need to massage connectionData?
		for (var i = 0; i < connectionData.length; i++) { 	
			if(connectionData[i].id == 'ipaddress') {
				if(!connectionInfo.ipaddress){
					form.fieldRefs.ipaddress.value = "";	
				}else{
			    	form.fieldRefs.ipaddress.value = connectionInfo.ipaddress;
		    	}
			    form.fieldRefs.ipaddress.hintText = 'IP/DNS';
			    form.fieldRefs.ipaddress.passwordMask = false;
			}
			
			if(connectionData[i].id == 'method') {
				if(!connectionInfo.method){
					form.fieldRefs.method.value = "";	
				}else{
			    	form.fieldRefs.method.value = connectionInfo.method;
			    }
			    form.fieldRefs.method.passwordMask = false;
			    form.fieldRefs.method.hintText = 'Default: http';
			}
			
			if(connectionData[i].id == 'port') {
				if(!connectionInfo.port){
					form.fieldRefs.port.value = "";	
				}else{
			    	form.fieldRefs.port.value = connectionInfo.port;
			    }
			    form.fieldRefs.port.hintText = 'Default: 80';
		   	}
			
			if(connectionData[i].id == 'username') {
				if(!connectionInfo.username){
					form.fieldRefs.username.value = "";	
				}else{
			    	form.fieldRefs.username.value = connectionInfo.username;
			    }
			    form.fieldRefs.username.hintText = 'Type User Name...';
			}
			
			if(connectionData[i].id == 'password') {
				if(!connectionInfo.password){
					form.fieldRefs.password.value = "";	
				}else{
			    	form.fieldRefs.password.passwordMask = true;
			    }
			    form.fieldRefs.password.value = connectionInfo.password;
			    form.fieldRefs.password.hintText = 'Type Password...';
			}
		};
	}
	
	function saveConnectionInfo(data){		
		var connectionType = Ti.App.Properties.getString('network_type');
		if(data.method){
			var method = data.method;	
		}else{
			var method = 'http';
		}
		if(data.port){
			var port = data.port;
		}else{
			var port = '80';
		}
	
		var data = {
			'ipaddress' : data.ipaddress,
			'method' : method,
			'port' : port,
			'username' : data.username,
			'password' : data.password
		}
		var dataStr = JSON.stringify(data);
		Ti.App.Properties.setString('conn_' + connectionType, dataStr);
		//Store it to the current settings so when we use the rest server it will work
		Ti.App.Properties.setString('conn_current', dataStr);
		
		Ti.API.info('user and pass' + data.username + ' ' + data.password + data.ipaddress + port);
	};
	getConnectionInfo(Titanium.App.Properties.getString('network_type'));			
	return self;
}

module.exports = SettingsWindow;
