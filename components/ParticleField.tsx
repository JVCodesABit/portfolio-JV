'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial, Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Particles() {
  const ref = useRef<THREE.Points>(null)

  const [positions, colors] = useMemo(() => {
    const count = 600
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const color1 = new THREE.Color('#00ffe0')
    const color2 = new THREE.Color('#a259ff')

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15
      const t = Math.random()
      const c = color1.clone().lerp(color2, t)
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return [pos, col]
  }, [])

  useFrame(({ clock, mouse }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.elapsedTime * 0.02 + mouse.x * 0.1
    ref.current.rotation.x = clock.elapsedTime * 0.01 + mouse.y * 0.05
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  )
}

function FloatingOrb({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.5}>
      <mesh position={position}>
        <icosahedronGeometry args={[0.8, 1]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.5}
          wireframe
          distort={0.3}
          speed={2}
        />
      </mesh>
    </Float>
  )
}

function GridPlane() {
  const ref = useRef<THREE.Mesh>(null)

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -8, 0]}>
      <planeGeometry args={[60, 60, 30, 30]} />
      <meshBasicMaterial
        color="#00ffe0"
        wireframe
        transparent
        opacity={0.07}
      />
    </mesh>
  )
}

function Scene() {
  const { camera } = useThree()
  useFrame(({ mouse }) => {
    camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.03
    camera.position.y += (mouse.y * 0.8 - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <Particles />
      <FloatingOrb position={[-8, 3, -5]} color="#00ffe0" />
      <FloatingOrb position={[9, -2, -8]} color="#a259ff" />
      <FloatingOrb position={[0, 6, -10]} color="#ff2d55" />
      <GridPlane />
    </>
  )
}

export default function ParticleField() {
  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 60 }}
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.2} />
      <Scene />
    </Canvas>
  )
}
