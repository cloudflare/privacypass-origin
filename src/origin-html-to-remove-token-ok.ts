import { Bindings } from './bindings';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (_env: Bindings) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">

<title>Cloudflare Research | Privacy Pass</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎟️</text></svg>">

<link href="https://research.cloudflare.com/css/standalone1.css" rel="stylesheet" type="text/css">

<style type="text/css">
  .header { border-bottom: 0; z-index: 100 }
  main { padding-right: 2rem; padding-bottom: 2rem }
  .q {
  	text-decoration: none;  	
    border: 1px solid var(--indigo-8);
    background-color: var(--indigo-9);
    padding: 0 0.2rem 0 0.2rem;
    color: black;
  }
  .q:hover {
    cursor: help;
  	text-decoration: none;
  	border: 1px solid var(--green-8);
    background-color: var(--green-9);
  }
  .q:visited {
    color: black;
  }
  .current {
  	display: table;
  	background-color: var(--orange-8);
  	border: 1px solid var(--orange-7);
  	margin-bottom: 0.2rem;
  }
  .current .num {
    margin-left: -1rem; 
    padding: 1rem 0.8rem 1rem 0.8rem; 
    background-color:var(--orange-7); 
    margin-right: 0.8rem;
  }
  div.action {
    position: relative;
    border-radius: 1rem;
    background-color: var(--violet-9);
  	border: 1px solid var(--violet-7);
  	padding: 0.5rem 1rem 0.5rem 1.5rem;
  	margin-bottom: 0.2rem;
    margin-top: -1rem;
    margin-left: 1.7rem;
  }
  div.error {
    position: relative;
    border-radius: 1rem;
    color: white;
    background-color: var(--indigo-2);
  	border: 1px solid var(--indigo-1);
  	padding: 0.5rem 1rem 0.5rem 1.5rem;
  	margin-bottom: 0.2rem;
    margin-top: -1rem;
    margin-left: 1.7rem;  	
  }
  div.error a {
  	color: white;
  }
  .box {
  	display: table;
  	background-color: white;
  	border: 1px solid var(--orange-8);
  	margin-bottom: 0.2rem;
  }
  .box .num {
    margin-left: -1rem; 
    padding: 1rem 0.8rem 1rem 0.8rem; 
    background-color:var(--orange-8); 
    margin-right: 0.8rem;
  }
  .snt {
    margin-top: 1rem;
    margin-right: -1rem;
  	float: right; 
  	background-color: green; 
  	color: white; 
  	width: 1.9rem;
  	height: 3rem; 
  	display: flex; 
  	justify-content: center; 
  	flex-direction: column; 
  	border-top: 1px solid var(--orange-8);
  	border-bottom: 1px solid var(--orange-8);
  }
  .hidden {
  	display: none;
  }
  .num.green {
  	background-color: green;
  	color: white;
  }  
</style>

</head>

<body>

<div class="wrapper" style="position: relative">
<header class="header">
  <a href="https://research.cloudflare.com"><img class="logo" src="https://research.cloudflare.com/img/logo.svg" alt="Cloudflare Research logo"></a>
  <a href="/" style="text-decoration: none"><span style="font-size: 1.4rem">Privacy Pass</span></a><!-- &nbsp;<small>"Privacy Pass with Private Access Tokens"</small> -->
  <span class="flare" style="background-color: var(--violet-2); color: white;">DEMO</span>
  <div style="position: absolute; display: block; border: 0; padding: 0; margin: 0; width: 100%; height: 0.2rem; top: 3.6rem; background: linear-gradient(70deg, var(--green-8) 30%, rgba(0,0,0,0) 30%), linear-gradient(30deg, var(--indigo-8) 60%, var(--orange-8) 60%);">&nbsp;</div>
</header>

<div class="description">
  <br>
  <div class="box" id="b1"><span class="num">1</span>Origin returns WWW-Authenticate header</div>
  <div class="snt hidden" id="snt">See new tab</div>
  <div class="box" id="b2"><span class="num">2</span>Attester presents challenge</div>
  <div class="box" id="b3"><span class="num">3</span>Issuer issues token</div>
  <div class="current" id="b4"><span class="num">4</span>New request to Origin made with token</div>
  <div class="action" id="a2">Page delivered successfully</div>
  <br><br>
</div>

<main>
  <br>
  <h2><a class="q" id="h" target="_blank" href="https://blog.cloudflare.com/eliminating-captchas-on-iphones-and-macs-using-new-standard/">Privacy Pass Token</a> &#127903;&#65039; valid</h2>
  <br>
  This origin response contains a <a class="q" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/WWW-Authenticate">WWW-Authenticate</a> HTTP header with a
  <a class="q" target="_blank" href="https://www.ietf.org/archive/id/draft-ietf-privacypass-auth-scheme-01.html">PrivateToken</a> challenge. <br><br>
  Browsers that support this authentication method may respond with a <a class="q" target="_blank" href="https://blog.cloudflare.com/eliminating-captchas-on-iphones-and-macs-using-new-standard/">Privacy Pass Token</a> to authenticate. <br><br>  
  The Silk - Privacy Pass Client extension (<a href="https://addons.mozilla.org/en-US/firefox/addon/privacy-pass/">Firefox</a>, <a href="https://chrome.google.com/webstore/detail/privacy-pass/ajhmfdgkijocedmfjonnpjfojldioehi">Chrome</a>) adds Privacy Pass support to your browser that opens an <a class="q" target="_blank" href="https://www.ietf.org/archive/id/draft-ietf-privacypass-architecture-16.html#name-attester-role">Attester</a> to issue a challenge. <br><br>
  You can learn more about how it works on <a href="https://blog.cloudflare.com/privacy-pass-standard">Cloudflare Blog</a>.
</main>


<footer class="footer" style="z-index: 2; background-color: white">
  <a class="plain" href="https://www.cloudflare.com"> Copyright &copy; <span id="year">2021</span>&nbsp;Cloudflare, Inc.&nbsp;</a>
  <script>document.getElementById( 'year' ).innerHTML = ( new Date().getFullYear() )</script>
  <a href="https://research.cloudflare.com/contact/">Contact us</a>
  <a href="https://www.cloudflare.com/privacypolicy/">Privacy policy</a>
  <a href="https://www.cloudflare.com/website-terms/">Terms of service</a>
</footer>
</div>

</body>

</html>
`;
