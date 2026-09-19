"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";
import { SITE } from "@/config/site";

/**
 * Scène 3D du véhicule.
 *
 * Ce module est chargé à la demande (React.lazy depuis Car3D) : three.js et
 * le modèle ne pèsent rien tant que le visiteur n'a pas atteint la section.
 */

/** Longueur réelle d'une Model 3, en mètres : sert d'unité à la scène. */
const CAR_LENGTH_M = 4.72;

/** Vue trois quarts avant, légèrement en contre-plongée. */
const CAMERA_POSITION: [number, number, number] = [4.9, 1.5, 5.7];
const TARGET: [number, number, number] = [0, 0.6, 0];

function Car({ onReady }: { onReady: () => void }) {
  // useDraco à false : le modèle est compressé en meshopt, inutile d'aller
  // chercher un décodeur Draco sur un CDN tiers.
  const { scene } = useGLTF(SITE.vehicle.model3d, false);

  // Le fichier est exporté dans ses propres unités (~111 par mètre) et n'est
  // centré sur rien. On le ramène à l'échelle métrique, centré sur l'origine
  // et posé sur le sol : la caméra et l'ombre portée deviennent prévisibles.
  const { scale, offset } = useMemo(() => {
    // Mesure sur un clone détaché, et non sur `scene` : setFromObject mesure
    // en espace monde, or la scène est montée dans les groupes ci-dessous.
    // La mesurer en place reviendrait à mesurer le résultat de son propre
    // redimensionnement, et l'échelle dériverait à chaque re-rendu.
    // `precise` traverse les sommets : l'AABB d'un nœud pivoté, sinon,
    // est nettement plus grande que la carrosserie réelle.
    const box = new Box3().setFromObject(scene.clone(true), true);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const s = CAR_LENGTH_M / Math.max(size.x, size.y, size.z);
    return { scale: s, offset: [-center.x * s, -box.min.y * s, -center.z * s] as [number, number, number] };
  }, [scene]);

  useEffect(() => onReady(), [onReady]);

  return (
    <group position={offset}>
      <group scale={scale}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

export default function CarScene({ autoRotate, onReady }: { autoRotate: boolean; onReady: () => void }) {
  return (
    <Canvas
      // dpr plafonné à 2 : au-delà, le coût GPU sur mobile ne se voit pas.
      dpr={[1, 2]}
      camera={{ fov: 32, position: CAMERA_POSITION, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      // pan-y : le doigt qui monte fait défiler la page, le doigt qui va sur
      // le côté fait tourner la voiture. Sans ça, la section piège le scroll.
      style={{ touchAction: "pan-y" }}
    >
      <Suspense fallback={null}>
        {/* Éclairage de studio généré dans la scène : aucune image HDR à
            télécharger, et la touche bleue reprend l'accent de la charte. */}
        <Environment resolution={256}>
          <Lightformer intensity={2.2} position={[0, 5, -9]} scale={[12, 12, 1]} />
          <Lightformer intensity={1.4} position={[-6, 1.5, -1]} rotation-y={Math.PI / 2} scale={[20, 1.5, 1]} />
          <Lightformer intensity={1.4} position={[6, 1.5, -1]} rotation-y={-Math.PI / 2} scale={[20, 1.5, 1]} />
          <Lightformer intensity={0.9} color="#0A84FF" position={[0, 2, 7]} scale={[12, 5, 1]} />
        </Environment>

        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 8, 5]} intensity={1.1} />

        <Car onReady={onReady} />

        {/* Ombre de contact plutôt qu'une vraie shadow map : sur 272 000
            triangles, la seconde coûte cher pour un résultat moins propre. */}
        <ContactShadows position={[0, 0, 0]} opacity={0.62} scale={8} blur={1.8} far={2.2} resolution={512} />
      </Suspense>

      <OrbitControls
        makeDefault
        target={TARGET}
        autoRotate={autoRotate}
        autoRotateSpeed={0.55}
        enableZoom={false}
        enablePan={false}
        // On reste à hauteur d'homme : ni vue du dessus, ni vue de dessous,
        // où ce modèle n'a rien à montrer.
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.48}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}

useGLTF.preload(SITE.vehicle.model3d, false);
