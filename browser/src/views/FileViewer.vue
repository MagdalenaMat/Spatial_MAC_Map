<template>
    <div>
      <ul>
        <li v-for="file in files" :key="file">
          <a :href="`https://storage.googleapis.com/spatial-mac-data/${file}`">{{ file }}</a>
        </li>
      </ul>
    </div>
  </template>

<script>
import data from "../lib/files.json";
export default {
  data() {
    return {
      files: data.files
    }
  }
}
</script>