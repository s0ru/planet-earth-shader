import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import earthVertexShader from './shaders/earth/vertex.glsl'
import earthFragmentShader from './shaders/earth/fragment.glsl'

// Debug
const gui = new GUI()

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

const textureLoader = new THREE.TextureLoader()
const earthDayTexture = textureLoader.load('./earth/day.jpg')
earthDayTexture.colorSpace = THREE.SRGBColorSpace
const earthNightTexture = textureLoader.load('./earth/night.jpg')
earthNightTexture.colorSpace = THREE.SRGBColorSpace
const earthSpecularCloudsTexture = textureLoader.load('./earth/scpecularClouds.jpg')

const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3())
    }   
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5)
const sunDirection = new THREE.Vector3()

const sun = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.1, 2),
    new THREE.MeshBasicMaterial()
)
scene.add(sun)

const updateSun = () => {
    sunDirection.setFromSpherical(sunSpherical)
    sun.position.copy(sunDirection).multiplyScalar(5)
    earthMaterial.uniforms.uSunDirection.value = sunDirection
}
updateSun()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 12
camera.position.y = 5
camera.position.z = 4
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor('#000011')

const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    earth.rotation.y = elapsedTime * 0.1

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

// Debug
gui
    .add(sunSpherical, 'phi')
    .min(0)
    .max(Math.PI)
    .onChange(updateSun)

gui
    .add(sunSpherical, 'theta')
    .min(- Math.PI)
    .max(Math.PI)
    .onChange(updateSun)

tick()