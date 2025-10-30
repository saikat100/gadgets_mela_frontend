export default function Head() {
  return (
    <>
      <script
        // set initial theme before paint to avoid flash
        dangerouslySetInnerHTML={{
          __html:
            "(function(){try{var t=localStorage.getItem('theme');if(t){document.documentElement.setAttribute('data-theme',t);}else{var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',d?'dark':'light');}}catch(e){}})();",
        }}
      />
    </>
  );
}
