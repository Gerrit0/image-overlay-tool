import Vue from 'vue'

import { Dimensions } from './dimensions'
import { Position } from './position'

const view = (window as any).view = new Vue({
  el: 'main',
  data: {
    image: undefined as HTMLImageElement | undefined,
    overlay: undefined as HTMLImageElement | undefined,
    position: Position.topLeft,
    offset: 10,
    scale: 33.33,
    scaleDimension: Dimensions.x
  },
  methods: {
    chooseImage ({ target }: { target: HTMLInputElement }) {
      if (!target.files || !target.files[0]) {
        console.warn('No files found.')
        return
      }
      const image = new Image()
      image.onload = () => this.image = image
      image.src = URL.createObjectURL(target.files[0])
    },
    chooseOverlay ({ target }: { target: HTMLInputElement }) {
      if (!target.files || !target.files[0]) {
        console.warn('No files found.')
        return
      }
      const image = new Image()
      image.onload = () => this.overlay = image
      image.src = URL.createObjectURL(target.files[0])
    }
  }
})

view.$watch(function () {
  return [this.image, this.overlay, this.position, this.offset, this.scale, this.scaleDimension]
}, function () {
  if (!this.image || !this.overlay) {
    return
  }

  const canvas = this.$refs.canvas as HTMLCanvasElement
  const context = canvas.getContext('2d')!

  canvas.width = this.image.width
  canvas.height = this.image.height

  context.drawImage(this.image, 0, 0)

  const [ overlayWidth, overlayHeight ] = getOverlaySize(this.image, this.overlay, this.scale, this.scaleDimension)

  const drawOverlay = (x: number, y: number) =>
    context.drawImage(this.overlay!, x, y, overlayWidth, overlayHeight)

  const centerX = canvas.width / 2 - overlayWidth / 2
  const centerY = canvas.height / 2 - overlayHeight / 2
  const farX = canvas.width - overlayWidth - this.offset
  const farY = canvas.height - overlayHeight - this.offset

  switch (this.position) {
    case Position.topLeft:
      return drawOverlay(this.offset, this.offset)
    case Position.topCenter:
      return drawOverlay(centerX, this.offset)
    case Position.topRight:
      return drawOverlay(farX, this.offset)
    case Position.middleLeft:
      return drawOverlay(this.offset, centerY)
    case Position.middleCenter:
      return drawOverlay(centerX, centerY)
    case Position.middleRight:
      return drawOverlay(farX, centerY)
    case Position.bottomLeft:
      return drawOverlay(this.offset, farY)
    case Position.bottomCenter:
      return drawOverlay(centerX, farY)
    case Position.bottomRight:
      return drawOverlay(farX, farY)
  }
})

function getOverlaySize (image: HTMLImageElement, overlay: HTMLImageElement, scale: number, scaleDimension: Dimensions): [number, number] {
  if (scaleDimension === Dimensions.x) {
    const width = Math.floor(image.width * scale / 100)
    const height = Math.floor(overlay.height * width / overlay.width)
    return [width, height]
  }

  const height = Math.floor(image.height * scale / 100)
  const width = Math.floor(overlay.width * height / overlay.height)
  return [width, height]
}
