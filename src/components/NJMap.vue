<template>
  <div class="map-container">
    <h2>New Jersey – Congressional District 7</h2>
    <div v-if="loading" class="loading">Loading map…</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="controls">
      <label :class="{ active: layer === 'district' }" @click="setLayer('district')">
        <span class="swatch district-swatch"></span> District outline
      </label>
      <label :class="{ active: layer === 'hispanic' }" @click="setLayer('hispanic')">
        <span class="swatch hispanic-swatch"></span> Spanish-speaking (% Hispanic/Latino)
      </label>
      <label :class="{ active: layer === 'young' }" @click="setLayer('young')">
        <span class="swatch young-swatch"></span> Young voters (% age 18–34)
      </label>
    </div>

    <div id="nj-map" ref="mapEl"></div>

    <div v-if="layer !== 'district'" class="legend">
      <div class="legend-title">{{ layer === 'hispanic' ? '% Hispanic/Latino' : '% age 18–34' }}</div>
      <div class="legend-scale">
        <span v-for="item in activeLegend" :key="item.label" class="legend-item">
          <span class="legend-color" :style="{ background: item.color }"></span>
          {{ item.label }}
        </span>
      </div>
      <div class="legend-note">{{ layer === 'hispanic' ? 'Source: ACS 2024 5-yr, Census tracts within NJ-07' : 'Source: ACS 2024 5-yr, voting-age pop.' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type LayerName = 'district' | 'hispanic' | 'young'

const mapEl = ref<HTMLElement | null>(null)
const loading = ref(true)
const error = ref('')
const layer = ref<LayerName>('district')

let map: L.Map | null = null
let districtLayer: L.GeoJSON | null = null
let hispanicLayer: L.GeoJSON | null = null
let youngLayer: L.GeoJSON | null = null
let demoData: any = null

// Color scales
const hispanicBreaks = [0, 5, 10, 20, 35, 100]
const hispanicColors = ['#fff5f0', '#fca082', '#fb5b34', '#cb1a1c', '#67000d']

const youngBreaks = [0, 10, 15, 20, 25, 100]
const youngColors  = ['#f7fbff', '#9ecae1', '#4292c6', '#2171b5', '#084594']

function colorFor(value: number, breaks: number[], colors: string[]): string {
  for (let i = 0; i < breaks.length - 1; i++) {
    if (value < breaks[i + 1]) return colors[i]
  }
  return colors[colors.length - 1]
}

const activeLegend = computed(() => {
  const [breaks, colors, suffix] =
    layer.value === 'hispanic'
      ? [hispanicBreaks, hispanicColors, '%']
      : [youngBreaks,    youngColors,    '%']
  return colors.map((c, i) => ({
    color: c,
    label: `${breaks[i]}–${breaks[i + 1]}${suffix}`,
  }))
})

function buildDemoLayers() {
  if (!demoData || !map) return

  hispanicLayer = L.geoJSON(demoData, {
    style: (f) => ({
      fillColor: colorFor(f?.properties.pct_hispanic ?? 0, hispanicBreaks, hispanicColors),
      fillOpacity: 0.75,
      color: '#666',
      weight: 0.5,
    }),
    onEachFeature: (f, l) => {
      const p = f.properties
      l.bindTooltip(
        `<strong>Tract ${p.TRACT}</strong><br>` +
        `Hispanic/Latino: <b>${p.pct_hispanic}%</b><br>` +
        `Spanish-speaking: <b>${p.pct_spanish}%</b><br>` +
        `Pop: ${p.total_pop.toLocaleString()}`,
        { sticky: true }
      )
    },
  })

  youngLayer = L.geoJSON(demoData, {
    style: (f) => ({
      fillColor: colorFor(f?.properties.pct_young ?? 0, youngBreaks, youngColors),
      fillOpacity: 0.75,
      color: '#666',
      weight: 0.5,
    }),
    onEachFeature: (f, l) => {
      const p = f.properties
      l.bindTooltip(
        `<strong>Tract ${p.TRACT}</strong><br>` +
        `Age 18–34: <b>${p.pct_young}%</b><br>` +
        `Pop: ${p.total_pop.toLocaleString()}`,
        { sticky: true }
      )
    },
  })
}

function setLayer(name: LayerName) {
  if (!map) return
  layer.value = name
  hispanicLayer?.remove()
  youngLayer?.remove()
  districtLayer?.remove()

  if (name === 'district') {
    districtLayer?.addTo(map)
  } else if (name === 'hispanic') {
    hispanicLayer?.addTo(map)
    districtLayer?.addTo(map)  // keep district outline on top
  } else if (name === 'young') {
    youngLayer?.addTo(map)
    districtLayer?.addTo(map)
  }
}

watch(layer, setLayer)

onMounted(async () => {
  if (!mapEl.value) return

  map = L.map(mapEl.value).setView([40.65, -74.5], 8)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map)

  try {
    const [districtRes, demoRes] = await Promise.all([
      fetch('/nj07.geojson'),
      fetch('/nj07-demo.geojson'),
    ])
    if (!districtRes.ok) throw new Error(`district HTTP ${districtRes.status}`)
    if (!demoRes.ok)     throw new Error(`demo HTTP ${demoRes.status}`)

    const districtGeojson = await districtRes.json()
    demoData = await demoRes.json()

    districtLayer = L.geoJSON(districtGeojson, {
      style: { color: '#c0392b', weight: 3, fillOpacity: 0, interactive: false },
    })

    buildDemoLayers()
    setLayer('district')

    districtLayer!.addTo(map)
    map.fitBounds(districtLayer!.getBounds(), { padding: [30, 30] })

    // Town markers
    const towns: [number, number, string][] = [
      [40.7054, -74.5557, 'Basking Ridge'],
      [40.8529, -74.8280, 'Hackettstown'],
    ]
    const icon = L.divIcon({ className: '', html: '<div class="town-dot"></div>', iconSize: [10, 10], iconAnchor: [5, 5] })
    for (const [lat, lng, name] of towns) {
      L.marker([lat, lng], { icon })
        .bindTooltip(name, { permanent: true, direction: 'right', offset: [8, 0], className: 'town-label' })
        .addTo(map!)
    }
  } catch (e: any) {
    error.value = `Failed to load map data: ${e.message}`
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  map?.remove()
})
</script>

<style scoped>
.map-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: sans-serif;
}

h2 { margin-bottom: 0.5rem; }

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.controls label {
  cursor: pointer;
  padding: 5px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
  background: #f9f9f9;
}

.controls label.active {
  border-color: #333;
  background: #fff;
  font-weight: 600;
}

.swatch {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 2px;
}

.district-swatch  { background: #c0392b; }
.hispanic-swatch  { background: #fb5b34; }
.young-swatch     { background: #2171b5; }

#nj-map {
  width: 700px;
  height: 550px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.loading, .error { margin-bottom: 0.5rem; color: #555; }
.error { color: #c0392b; }

.legend {
  margin-top: 0.5rem;
  font-size: 12px;
  text-align: center;
}

.legend-title { font-weight: 600; margin-bottom: 4px; }

.legend-scale {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

.legend-color {
  display: inline-block;
  width: 16px;
  height: 12px;
  border: 1px solid #aaa;
}

.legend-note { color: #888; margin-top: 4px; font-size: 11px; }
</style>

<style>
.town-dot {
  width: 10px;
  height: 10px;
  background: #2c3e50;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

.town-label {
  background: rgba(255,255,255,0.9);
  border: 1px solid #aaa;
  border-radius: 3px;
  padding: 2px 5px;
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.town-label::before { display: none; }
</style>
