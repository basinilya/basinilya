//******************************************************************************
//************************* SETTINGS *******************************************
var myhostname = "m4_MYHOSTNAME";
var allowDnsResolve = false;
var defaultHTTPProxy = "PROXY proxy.reksoft.ru:3128";
//var defaultHTTPProxy = "SOCKS proxy.reksoft.ru:1080";
//defaultHTTPProxy = "DIRECT";

var directHostsStr = ""
//direct hosts list obtained from your Admin:
//+","+ ".mozilla-russia.org, google.ru"
+","+ "intranet.tsconsulting.ru, *reksoft.com,*reksoft.ru, *reksoft.se; *reksoft.de; *arustel.ru; *fotoscape.ru; *fotosafari.ru; *comnews.ru; *comnewsgroup.ru; *infocom-online.ru; *geneva-telecom.ru; *standart-magazine.ru; *pixart.ru; *winnlodge.com; *astecindustries.ru; *astecunderground.ru; *photoscape.ru; *psychoanalystcenter.ru; *roadtec.ru; *smartevent.ru; *soamo.ru; *soamo.com; *telsmith.ru; *tf.ru; *web-booking.ru; *prompt-delivery.ru; *elmost.ru"
//custom direct hosts list:
//+","+ "my.router"
+","+ "*svn.sicap-france.com, *confluence.sicap.com, 195.239.233.0/24, 81.211.109.0/24, liveweb-dev.swisscom-mobile.ch, 194.186.172.194"
;

function customFindProxyForURL(url, host,sHostIp) //called after directhosts checked. if returned null, defaultHTTPProxy is used
{
//    log("customFindProxyForURL("+url+","+host+","+sHostIp+")");

    if (host)
    {
        if( 1==2
        )
        {
                return "SOCKS blackbird.reksoft.ru:10008";
        }
        if( 1==2
                || "172.21.7.3"==host
                || "172.21.7.6"==host

                || "192.168.95.140"==host

                || "stsicap11p"==host
                || "stsicap11p.sicap.ch"==host

                || "ztvimmig1p"==host
                || "ztvimmig1p.sicap.ch"==host

                || "10.132.252.88"==host
                || "ztpayfme1p"==host
                || "ztpayfme1p.sicap.ch"==host

                || "ztislrap1p"==host
                || "ztislrap1p.sicap.ch"==host

                || "apollon"==host
                || "apollon.sicap.ch"==host
        )
        {
                return "SOCKS blackbird.reksoft.ru:10006";
        }
    }

    if (sHostIp)
    {
	    if(isInNet(sHostIp, "10.132.248.0" , "255.255.248.0"))
	    {
		    return "SOCKS blackbird.reksoft.ru:10006";
	    }
    }

    if(myhostname == "il")
    {
        if ( (host == "svn.sicap-france.com" || host == "192.168.148.28") )
            return "PROXY proxy.reksoft.ru:3128";
    }

    if(myhostname != "il") {
        if (
/194.186.172.231/i.test(host)
|| /fishki.net/i.test(host)
|| /fontanka.fi/i.test(host)
|| /47news.ru/i.test(host)
|| /47news.ru/i.test(host)
|| /doctorpiter.ru/i.test(host)
|| /retail.payment.ru/i.test(host)
|| /193.200.10.25/i.test(host)
        ) return "SOCKS proxy.reksoft.ru:1080";

        if ( false
  ||   /avangard-dsl.ru/i.test(host)
// ||   /userapi.com/i.test(host)
        ) return "PROXY blackbird.reksoft.ru:63128";

    }

    if (isPlainHostName(host)) {
        log("plain hostname: " + host );
        return "DIRECT";
    }

    if(myhostname != "il") {
        if (
        /^ftp:\/\//i.test(url)
        ||
        /^https:\/\/(?![^\/:]*:443(\/|$)|[^\/:]*:80(\/|$)|[^\/:]*(\/|$))/i.test(url)
//                  not(                            
//                     hhhhhhh:443(/|$)             
//                     or                hhhhhhh:80(/|$)
//                     or                                 hhhhhhh(/|$)
//                     )                            
        ) return "SOCKS proxy.reksoft.ru:1080";
    }

    return null;
}
//******************************************************************************
//******************************************************************************

function htonl(hS_addr) {
    return (hS_addr<<24)|((hS_addr&0x0000FF00)<<8)|((hS_addr&0x00FF0000)>>>8)|(hS_addr>>>24);
}

function inet_ntoa(nS_addr) {
    return ((nS_addr)     &0xFF)+"."
        +((nS_addr>>>8 )&0xFF)+"."
        +((nS_addr>>>16)&0xFF)+"."
        +((nS_addr>>>24)&0xFF)
    ;
}
function cidr2str(cidr) {
    return inet_ntoa(0xFFFFFFFF >>> (32 - cidr));
}

function ParseSubnet(host) {
    var r = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(\/(\d{1,2}))?$/;
    r.lastIndex = 0;
    var test = r.exec(host);
    if (!test) {
        return null;
    } 
    if (test[1] > 255 || test[2] > 255 || 
               test[3] > 255 || test[4] > 255 || test[6] > 32) {
        return null; // not a Subnet
    }
    var rslt = { 
        "ip" : test[1]+"."+test[2]+"."+test[3]+"."+test[4] , 
        "mask" : null
        };
    rslt.mask = null;
    if (test[6] && test[6]!="") rslt.mask = cidr2str(test[6]);
    return rslt;
}

function trim(string)
{
    return string.replace(/(^\s+)|(\s+$)/g, "");
}

var lastLogMessage;
function log(message) {
    lastLogMessage = message;
    vr=new Date();
    message = vr.getHours()+":"+vr.getMinutes()+":"+vr.getSeconds() + " " + message;
    if (typeof(logPacUtils) != "undefined") {
        logPacUtils(message);
    }
    if (
        (typeof(alert) != "undefined") // function present
        && (typeof(alert) != "unknown") // not IE
        && (typeof(alertDisabled) == "undefined") // not disabled
	) 
    {
 	   alert(message);
    }
}

log("PAC init " + myIpAddress());

function logClear() {
    if (typeof(logClearPacUtils) != "undefined") {
        logClearPacUtils();
    }
}

var MATCHHOSTSLIST_NOTMATCHED = 0;
var MATCHHOSTSLIST_SUBNET = 1;
var MATCHHOSTSLIST_HOSTNAME = 2;
var MATCHHOSTSLIST_IP = 3;

function MatchHostsList(host, sHostIp, HostsStr)
{
    var directHosts = HostsStr.split(/[;,]/g);
    var oSubnet; //current parsed item from HostsStr
    var s, key;
    for (key in directHosts) {
        s = trim(directHosts[key]);
        if (s=="") continue;
        oSubnet = ParseSubnet(s);
        if (oSubnet) {
            //log("ip: " + oSubnet.ip + " mask " + oSubnet.mask);
            if (sHostIp && isInNet(sHostIp, oSubnet.ip, oSubnet.mask ? oSubnet.mask : "255.255.255.255")) {
                return MATCHHOSTSLIST_SUBNET;
            }
            directHosts[key] = null;
        }
        if (s.substr(0,1)==".") {
                s = "*"+s;
        }
        s = "^(www\.)?" + s.replace(/\./g,"\\.").replace(/\*/g,".*") + "$";
        if (host && host!="") {
            //log("regex: " + s);
            if ((new RegExp(s,"i")).test(host)) {
                return MATCHHOSTSLIST_HOSTNAME;
            }
        }
        if (sHostIp && sHostIp!="") {
            if ((new RegExp(s,"i")).test(sHostIp)) {
                log("regexp: "+s);
                return MATCHHOSTSLIST_IP;
            }
        }
    }
    return MATCHHOSTSLIST_NOTMATCHED;
}

function FindProxyForURL(url, host)
{
    PACevalRE = /PACeval\/(.*)/g;
    PACevalRE.lastIndex = 0; //FF bug, reusable global RE objects
    if (toeval=PACevalRE.exec(url)) {
	toeval=toeval[1];
	try {
        log("PACeval!: typeof("+toeval+"): "+eval("typeof("+toeval+")"));
        log("PACeval!: "+toeval+": "+eval(toeval));
	} catch (e) {}
	return "DIRECT";
    }

    log("FindProxyForURL(\""+url+"\", \""+host+"\")");

    var sHostIp = ParseSubnet(host); if (sHostIp) sHostIp = sHostIp.ip; //host if it's a correct ip, otherwise null. No dnsResolve

    s = customFindProxyForURL(url, host, sHostIp);
    if (s && s!="") {
        log("customFindProxyForURL()=="+s);
        return s;
    }

    matched = MatchHostsList(host, sHostIp, directHostsStr);
    if (matched != MATCHHOSTSLIST_NOTMATCHED)
    {
        if (matched == MATCHHOSTSLIST_SUBNET) {
            log("subnet matched at early stage");
        } else if (matched == MATCHHOSTSLIST_HOSTNAME) {
            log("hostname matched");
        } else if (matched == MATCHHOSTSLIST_IP) {
            log("ip matched against wildcard");
        }
        return "DIRECT";
    }

    if (isPlainHostName(host)) {
        log("plain hostname: " + host );
        return "DIRECT";
    } else {
        log("not plain hostname: " + host );
    }

    if (allowDnsResolve&&!sHostIp) {
        sHostIp = dnsResolve(host);
        log("forced dnsResolve(\""+host+"\")==\""+sHostIp+"\"");
        if (sHostIp=="") sHostIp = null;
    }
    if (sHostIp)
    {
            if (
                    isInNet(sHostIp, "10.0.0.0", "255.0.0.0") ||
                    isInNet(sHostIp, "172.16.0.0", "255.240.0.0") ||
                    isInNet(sHostIp, "192.168.0.0", "255.255.0.0") ||
                    isInNet(sHostIp, "127.0.0.0", "255.0.0.0") ||
                    isInNet(sHostIp, "164.28.43.147", "255.255.255.255"))
            {
                log("standard LAN subnet matched: " + host);
                    return "DIRECT";
            }

        matched = MatchHostsList(host, sHostIp, directHostsStr);
        if (matched != MATCHHOSTSLIST_NOTMATCHED)
        {
            if (matched == MATCHHOSTSLIST_SUBNET) {
                log("subnet matched at late stage");
            } else if (matched == MATCHHOSTSLIST_HOSTNAME) {
                log("hostname matched");
            } else if (matched == MATCHHOSTSLIST_IP) {
                log("ip matched against wildcard");
            }
            return "DIRECT";
        }

        s = customFindProxyForURL(url, host, sHostIp);
        if (s && s!="") {
            log("customFindProxyForURL()=="+s);
            return s;
        }
    }

    //log("not matched any rule, invoking customFindProxyForURL");

    
    s = defaultHTTPProxy;
    
    log("using: " + s);
    
	return s;
}

function RunTests() {
    allowDnsResolve = true;
    defaultHTTPProxy = "PROXY 127.0.0.1:3128";
    saveDirectHosts = directHostsStr;
    try {
    directHostsStr = directHostsStr+","
        + "92.241.170.*," //subnet of 3dnews.ru must log: 'hostname matched' or 'ip matched against wildcard' or 
        + "87.250.251.11/24," //yandex.ru: must log 'subnet matched at early stage' or 'subnet matched at late stage'
        + "77.88.21.11/24," //yandex.ru #2: must log 'subnet matched at early stage' or 'subnet matched at late stage'
        + "213.180.204.11/24," //yandex.ru #3: must log 'subnet matched at early stage' or 'subnet matched at late stage'
        + "93.158.134.11/24," //yandex.ru #4: must log 'subnet matched at early stage' or 'subnet matched at late stage'

        + "1.2.3.4/24," // ip only, must log 'subnet matched at early stage'
        + ".mozilla-russia.org," // autoinsert leading '*' , must log 'hostname matched'
        + "google.com," //must also work for www.google.com
    ;

    logClear();
    var rslt, key, host;
    var tests = [
        [ "92.241.170.196" , "hostname matched" ] , 
        [ "3dnews.ru" , "ip matched against wildcard" ] ,

        [ "87.250.251.11" , "subnet matched at early stage" ] , 
        [ "yandex.ru" , "subnet matched at late stage" ] ,

        [ "1.2.3.101" , "subnet matched at early stage" ] , 

        [ "foo.mozilla-russia.org" , "hostname matched" ] , 

        [ "www.google.com" , "hostname matched" ] , 

        [ "www.yahoo.com" , "using: PROXY 127.0.0.1:3128" ] , 

        [ "*svn.sicap-france.com" , "hostname matched" ] ,

        [ "10.132.248.2" , "customFindProxyForURL()" ] ,

        [ "stsicap11p" , "customFindProxyForURL()" ] ,

        [ "eeeeeeeeee" , "plain hostname" ] ,
    ]; 
        for(key in tests) {
            host = tests[key][0];
            log("testing: "+host);
            FindProxyForURL("http://"+host+"/",host);
            if ( !lastLogMessage || !(lastLogMessage==tests[key][1] || ((new RegExp(tests[key][1],"i")).test(lastLogMessage)))  ) {
                log("test error, unexpected result");
                return;
            }
            log("**************");
        }
        log("ALL TESTS OK");
    } catch (ex) {
        log("UNKNOWN ERROR");
    }
    directHostsStr = saveDirectHosts;
}
