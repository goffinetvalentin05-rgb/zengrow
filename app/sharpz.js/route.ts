export async function GET() {
  const script = `(function(){
  var s=document.currentScript;
  if(!s)return;
  var site=s.getAttribute("data-site");
  if(!site)return;
  var base=s.src.replace(/\\/sharpz\\.js.*$/,"");
  var endpoint=base+"/api/sharpz/collect";
  function id(prefix){
    try{
      var k="_sz_"+prefix;
      var v=localStorage.getItem(k);
      if(!v){v=prefix+"_"+Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem(k,v);}
      return v;
    }catch(e){return prefix+"_"+Math.random().toString(36).slice(2);}
  }
  var visitorId=id("v");
  var sessionId=(function(){
    try{
      var k="_sz_sid";
      var v=sessionStorage.getItem(k);
      if(!v){v="s_"+Math.random().toString(36).slice(2);sessionStorage.setItem(k,v);}
      return v;
    }catch(e){return "s_"+Math.random().toString(36).slice(2);}
  })();
  function params(){
    var q=location.search.replace(/^\\?/,"").split("&");
    var out={};
    for(var i=0;i<q.length;i++){
      var p=q[i].split("=");
      if(p[0])out[decodeURIComponent(p[0])]=decodeURIComponent(p[1]||"");
    }
    return out;
  }
  function send(type){
    var p=params();
    var body=JSON.stringify({
      siteKey:site,
      sessionId:sessionId,
      visitorId:visitorId,
      eventType:type||"pageview",
      path:location.pathname+location.search,
      referrer:document.referrer||"",
      utmSource:p.utm_source||"",
      utmMedium:p.utm_medium||"",
      utmCampaign:p.utm_campaign||""
    });
    if(navigator.sendBeacon){
      navigator.sendBeacon(endpoint,new Blob([body],{type:"application/json"}));
      return;
    }
    fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:body,keepalive:true,credentials:"omit"}).catch(function(){});
  }
  send("pageview");
})();`;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
