# Spatial Macrophage Map

A comprehensive spatial visualization of immunofluorescence slides through our dedicated viewer.

## **Introduction**

We have developed a web-based slide viewer, inspired by [ImmunoViewer](https://github.com/davidvi/ImmunoViewer), specifically tailored to display detailed immunofluorescence scans.

## **Features**

1. **Slide Viewer**: View high-quality, tiled immunofluorescence slides [here](https://magdalenamat.github.io/Spatial_MAC_Map/#/).
   
2. **High Scalability**: Using of Google Cloud Platform, our viewer ensures quick loading times and efficient data access.

3. **Interactive Annotations**: Slides hosted on Firebase.

## **Technical Overview**

### Image Tiling Process
Images were processed and segmented into tiles for efficient loading using [ImmunoViewer](https://github.com/davidvi/ImmunoViewer):

```bash
ImmunoViewerProcess -t [number of threads] [data_directory]
```

These tiles are then uploaded to a dedicated Google Cloud Platform bucket to ensure quick access and reliable storage.

### Annotations Hosting

- **Firebase Integration**: Annotations on each slide are saved in real-time using a Firebase cloud function.
- **Firestore Database**: Our Firestore database retains all annotations.

### Project Hosting

The UI is hosted on GitHub as a project page, enabling easy accessibility for the community and researchers.

## **Contribute & Feedback**

We welcome collaboration and feedback. The source code and more details can be found on our [GitHub repository](https://github.com/MagdalenaMat/Spatial_MAc_Map).
