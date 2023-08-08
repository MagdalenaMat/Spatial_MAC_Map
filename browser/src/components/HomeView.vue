<template>
    <div>
      <h1>About</h1>
      <p>This IF Viewer enables swift and intuitive exploration of images acquired for the Spatial Macrophage Map Project, offering an invaluable visual resource for comprehending the scope of its findings.</p>
      
      <h1>User Guide</h1>
        <ol>
          <li>To navigate through this resource, use the two drop down menus to select and render an image.</li>
          <li>Use your mouse or trackpad for high resolution deep-zoom in and intuitive navigation.</li>
          <li>Legend listing stained protein names is located on the bottom left corner.</li>
          <li>Images can be downloaded by clicking the Download slide button on the bottom left corner.</li>
          <li>To share an image, click on the Current slide URL and copy link address.</li>
          <li>Additional images and tabular data used to construct the Spatial Human Macrophage Map can be accessed under STUDY FILES button on the top right corner.</li>
        </ol>

  
      <h1>Credit</h1>
      <p>
        The IF Viewer has been constructed by David G.P. van IJzendoorn. It is based on the OpenSeadragon Viewer, allowing high-resolution, deep-zoom image viewing. The user interface was constructed with Vue.js. All images were tiled to enable fast loading using the ImmunoViewer python package. Image data is hosted on the Google Cloud Platform. The viewer's source code is also available on our project's GitHub page: <a href="https://github.com/MagdalenaMat/Spatial_MAC_Map/tree/main/browser">GitHub</a>.
      </p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'InfoPage'
  }
  </script>
  