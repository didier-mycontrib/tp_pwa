//main.js (callbacks for dom)
function cb_display_data(data){
	//console.log("in cb_display_data data="+data);
	var dataDiv = document.getElementById("dataDiv");
	dataDiv.innerHTML=data;
}