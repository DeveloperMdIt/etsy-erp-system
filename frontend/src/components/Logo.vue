<template>
  <div :class="['flex items-center', containerClass]">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      :viewBox="collapsed ? '0 0 90 120' : '0 0 520 120'"
      class="transition-all duration-300"
      :class="[logoClass, collapsed ? 'h-8' : 'h-10']"
    >
      <!-- Icon: clean isometric cube -->
      <g transform="translate(0,12)">
        <!-- outer cube -->
        <polygon
          points="40,0 80,22 80,66 40,88 0,66 0,22"
          fill="none"
          :stroke="iconColor || '#2563EB'"
          stroke-width="6"
          stroke-linejoin="round"/>

        <!-- vertical center edge -->
        <line x1="40" y1="0" x2="40" y2="88"
          :stroke="iconColor || '#2563EB'"
          stroke-width="6"
          stroke-linecap="round"/>
      </g>

      <!-- Text -->
      <template v-if="!collapsed">
          <text x="120" y="78"
                font-family="Inter, Arial, sans-serif"
                font-size="56"
                font-weight="600"
                :fill="textColorPrimary || '#2563EB'">
            Invent
          </text>

          <text x="295" y="78"
                font-family="Inter, Arial, sans-serif"
                font-size="56"
                font-weight="600"
                :fill="textColorSecondary || '#22C55E'">
            ivy
          </text>
      </template>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  collapsed?: boolean
  containerClass?: string
  logoClass?: string
  iconColor?: string
  textColorPrimary?: string
  textColorSecondary?: string
}>()
</script>
