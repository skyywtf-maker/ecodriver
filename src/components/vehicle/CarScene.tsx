"use client";

import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import { Box3, Vector3, type Group, type PerspectiveCamera } from "three";
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

/** Amplitude de rotation sur toute la traversée de la section : un peu plus d'un demi-tour. */
const SCROLL_TURN = Math.PI * 1.1;

type Props = {
  /** Avancée du défilement dans la section, de 0 à 1. Un ref, pour ne pas
      redessiner React à chaque pixel de scroll. */
  progress: RefObject<number>;
  scrollDriven: boolean;
  showHotspots: boolean;
  onReady: () => void;
};

function Car({ progress, scrollDriven, showHotspots, onReady }: Props) {
  // useDraco à false : le modèle est compressé en meshopt, inutile d'aller
  // chercher un décodeur Draco sur un CDN tiers.
  const { scene } = useGLTF(SITE.vehicle.model3d, false);
  const spin = useRef<Group>(null);

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

  // La voiture tourne sur elle-même au fil du défilement. On lisse vers la
  // cible plutôt que de la suivre au pixel : le mouvement reste doux même
  // quand le scroll arrive par à-coups.
  useFrame((_, delta) => {
    if (!spin.current || !scrollDriven) return;
    const target = (progress.current ?? 0) * SCROLL_TURN;
    const k = 1 - Math.exp(-6 * delta);
    spin.current.rotation.y += (target - spin.current.rotation.y) * k;
  });

  return (
    <group ref={spin}>
      <group position={offset}>
        <group scale={scale}>
          <primitive object={scene} />
        </group>
      </group>

      {showHotspots &&
        SITE.vehicle.hotspots.map((h) => (
          <Html
            key={h.label}
            position={h.at as [number, number, number]}
            center
            // Pas d'occlusion : masquée par la carrosserie, l'étiquette
            // disparaissait sur la moitié de la rotation. Elle flotte donc
            // au-dessus du point qu'elle désigne, toujours lisible, reliée
            // par un trait. Affichée à toutes les tailles, en plus petit
            // sur téléphone.
            zIndexRange={[10, 0]}
          >
            <span className="pointer-events-none flex -translate-y-5 flex-col items-center md:-translate-y-7">
              <span className="glass-soft whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-medium text-white/90 md:px-3 md:py-1.5 md:text-[11px]">
                {h.label}
              </span>
              <span className="h-3 w-px bg-white/35 md:h-4" />
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
          </Html>
        ))}
    </group>
  );
}

/**
 * Recule la caméra juste ce qu'il faut pour que la voiture tienne dans le
 * cadre quel que soit son angle et quel que soit le format du canevas.
 *
 * Une distance figée ne peut pas convenir aux deux : le bloc est large et bas
 * sur ordinateur, presque carré sur téléphone. Et de profil, la voiture
 * présente ses 4,72 m, contre moins de 2,10 m de face.
 */
function FitCamera() {
  const { camera, size, controls } = useThree();

  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    const vFov = (cam.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * (size.width / size.height));
    // Encombrement à couvrir : la longueur du véhicule et un peu de marge,
    // pour que la rotation ne vienne jamais frôler les bords.
    const distance = Math.max(
      (CAR_LENGTH_M + 1.1) / (2 * Math.tan(hFov / 2)),
      (CAR_LENGTH_M * 0.55) / (2 * Math.tan(vFov / 2))
    );

    const target = new Vector3(...TARGET);
    const direction = new Vector3().subVectors(cam.position, target).normalize();
    cam.position.copy(direction.multiplyScalar(distance).add(target));
    cam.updateProjectionMatrix();
    (controls as { update?: () => void } | null)?.update?.();
  }, [camera, size, controls]);

  return null;
}

export default function CarScene(props: Props) {
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

        <Car {...props} />

        {/* Ombre de contact plutôt qu'une shadow map : sur 272 000 triangles,
            la seconde coûte cher pour un résultat moins propre. */}
        <ContactShadows position={[0, 0, 0]} opacity={0.62} scale={8} blur={1.8} far={2.2} resolution={512} />
      </Suspense>

      <FitCamera />

      <OrbitControls
        makeDefault
        target={TARGET}
        // La rotation vient du défilement ; la souris et le doigt déplacent
        // la caméra autour. Les deux se composent sans se contredire.
        autoRotate={!props.scrollDriven}
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
