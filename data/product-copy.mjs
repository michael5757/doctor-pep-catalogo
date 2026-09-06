// Consumer-facing copy. Editorial references remain in catalog.mjs, outside the public payload.
// Research topics and natural biological functions are not claims of efficacy for an offered vial.
const copy = (summary, what, usage, benefits, benefitsTitle = 'Beneficios potenciales', note = '') =>
  ({ summary, what, usage, benefits, benefitsTitle, note });

export const productCopy = {
  'tirzepatide': copy(
    'Apetito y metabolismo: conoce la doble acción de la tirzepatida.',
    'La tirzepatida es un ingrediente que actúa sobre dos señales del organismo, GIP y GLP-1, relacionadas con el apetito y el metabolismo.',
    'Se utiliza en medicamentos para el manejo del peso en adultos con obesidad o sobrepeso acompañado de problemas de salud, junto con alimentación y actividad física.',
    ['Ayuda a reducir el apetito y la cantidad de alimentos que se consume.', 'Favorece la pérdida de peso y su mantenimiento en las personas para quienes está indicada.'],
    'Beneficios del ingrediente',
    'Requiere valoración médica y una formulación indicada para cada persona. No usar con antecedentes personales o familiares de carcinoma medular de tiroides o MEN2.'),
  'retatrutide': copy(
    'Tres vías de acción: GIP, GLP-1 y glucagón en una misma molécula.',
    'La retatrutida es una molécula que actúa sobre tres receptores relacionados con el metabolismo: GIP, GLP-1 y glucagón.',
    'Su potencial se centra en el manejo del peso y la glucosa. Es una opción experimental, todavía en evaluación clínica.',
    ['Reducción del peso corporal.', 'Mejora del control de la glucosa.']),
  'mots-c': copy(
    'Mitocondrias y metabolismo: conoce este péptido de origen celular.',
    'MOTS-C es un péptido relacionado con las mitocondrias, las estructuras de las células que participan en la producción de energía.',
    'Su interés está en cómo las células aprovechan la glucosa y responden a la insulina. Estas aplicaciones son experimentales, basadas en resultados preclínicos.',
    ['Mejor aprovechamiento de la glucosa por las células.', 'Regulación de los procesos metabólicos.']),
  'bpc-157': copy(
    'Una cadena de 15 aminoácidos vinculada a la biología de la reparación.',
    'BPC-157 es un péptido sintético formado por una cadena de 15 aminoácidos.',
    'Su potencial se relaciona con la cicatrización y la reparación de tejidos. Son aplicaciones experimentales, con resultados principalmente preclínicos.',
    ['Apoyo a los mecanismos de cicatrización.', 'Recuperación de tejidos lesionados en modelos experimentales.']),
  'tb-500': copy(
    'Conoce la conexión entre este péptido y la timosina beta-4.',
    'TB-500 es una denominación utilizada para un péptido relacionado con la timosina beta-4, una proteína que participa en el movimiento y la organización celular.',
    'Su interés está en los procesos de movimiento y organización de las células. Sus aplicaciones terapéuticas son experimentales y dependen de la identidad concreta del péptido.',
    ['Relación con la familia de péptidos de la timosina beta-4.', 'Interés biológico en el movimiento y la organización celular.'], 'Qué lo distingue'),
  'cjc-1295-no-dac-ipamorelin': copy(
    'Dos componentes en una presentación: CJC NO DAC e ipamorelina.',
    'Es una combinación declarada de CJC 1295 NO DAC e ipamorelina, con 5 mg de cada componente.',
    'Reúne dos componentes relacionados con las señales de liberación de hormona del crecimiento. La aplicación de esta combinación es experimental.',
    ['Presentación combinada de 5 mg + 5 mg.', 'Dos componentes con vías de señalización hormonal diferentes.'], 'Qué lo distingue',
    'Los efectos de la combinación requieren evaluación propia; NO DAC identifica una formulación específica.'),
  'tesamorelin': copy(
    'Tesamorelina: conoce su acción sobre la grasa visceral en su indicación médica.',
    'La tesamorelina es un péptido análogo de GHRH, una señal natural que estimula la liberación de hormona del crecimiento.',
    'Se utiliza en medicamentos para reducir el exceso de grasa abdominal visceral en adultos con VIH y lipodistrofia.',
    ['Reducción de grasa visceral en la población para la que está indicada.'],
    'Beneficio en su indicación médica',
    'Uso bajo valoración médica; no está indicada para adelgazar en general. Está contraindicada durante el embarazo y con cáncer activo.'),
  'ipamorelin': copy(
    'Ipamorelina y su acción selectiva sobre una señal hormonal.',
    'La ipamorelina es un péptido que actúa sobre receptores relacionados con la grelina y la liberación de hormona del crecimiento.',
    'Destaca por su capacidad de estimular la liberación de hormona del crecimiento. Su aplicación terapéutica es experimental.',
    ['Estimulación selectiva de la liberación de hormona del crecimiento.']),
  'pt-141': copy(
    'Deseo sexual: conoce la bremelanotida y su indicación médica.',
    'PT-141 es el nombre con el que también se conoce a la bremelanotida, una molécula que actúa sobre receptores de melanocortina.',
    'Se utiliza en medicamentos para el deseo sexual hipoactivo adquirido y generalizado en mujeres premenopáusicas, tras una valoración médica.',
    ['Mejora del deseo sexual en las mujeres para quienes está indicada.', 'Reducción del malestar asociado a esa disminución del deseo.'],
    'Beneficios en su indicación médica',
    'La indicación depende de la formulación y la valoración médica. Está contraindicada con hipertensión no controlada o enfermedad cardiovascular conocida.'),
  'kiss-peptin': copy(
    'Kisspeptina: una conexión entre el cerebro y las hormonas reproductivas.',
    'Las kisspeptinas son péptidos que participan en la comunicación entre el cerebro y el sistema reproductivo.',
    'Participan en la activación de señales hormonales de la reproducción. Su aplicación en reproducción asistida, incluida la maduración de óvulos, es experimental.',
    ['Activación de señales hormonales de la reproducción.', 'Posibles aplicaciones en reproducción asistida.'],
    'Beneficios potenciales', 'Existen distintas formas de kisspeptina; sus aplicaciones dependen de la forma utilizada.'),
  'ss-31': copy(
    'Elamipretida: acción dirigida al interior de las mitocondrias.',
    'SS-31, también conocido como elamipretida, es un péptido que actúa en las mitocondrias, donde las células producen gran parte de su energía.',
    'Una formulación de elamipretida tiene una indicación médica para mejorar la fuerza muscular en pacientes con síndrome de Barth que pesan al menos 30 kg.',
    ['Mejora de la fuerza muscular en esa indicación específica.'],
    'Beneficio en su indicación médica', 'La elección de la formulación y su uso corresponden al equipo médico especializado.'),
  'ara-290': copy(
    'Cibinetida: un péptido relacionado con las señales de reparación celular.',
    'ARA-290, también llamado cibinetida, es un péptido relacionado con señales de protección y reparación de tejidos.',
    'Su potencial está en el alivio de molestias de las fibras nerviosas pequeñas y en los procesos de reparación nerviosa. Es una aplicación terapéutica experimental.',
    ['Posible alivio de síntomas de neuropatía de fibras pequeñas.', 'Apoyo a procesos de protección y reparación nerviosa.']),
  'glutathione': copy(
    'Conoce uno de los protagonistas de la defensa antioxidante del organismo.',
    'El glutatión es una molécula formada por tres aminoácidos que el cuerpo produce de manera natural.',
    'En el organismo participa en la protección de las células frente al estrés oxidativo y en reacciones de transformación de sustancias.',
    ['Participa en la defensa antioxidante de las células.', 'Ayuda a mantener el equilibrio químico del entorno celular.'],
    'Funciones naturales en el organismo', 'Estas funciones describen al glutatión presente en el cuerpo, no resultados demostrados de administrar este vial.'),
  'ghk-cu': copy(
    'Tres aminoácidos y cobre: conoce el complejo GHK-Cu.',
    'GHK-Cu es un complejo formado por un pequeño péptido de tres aminoácidos unido a cobre.',
    'Su interés está en la producción de colágeno y los procesos de reparación de tejidos. Estas aplicaciones se basan en resultados celulares y son experimentales para este formato.',
    ['Apoyo a la síntesis de colágeno en modelos celulares.', 'Participación en procesos relacionados con la reparación de tejidos.']),
  'epitalon': copy(
    'Cuatro aminoácidos conectados con la biología de los telómeros.',
    'Epitalon es un péptido sintético de cuatro aminoácidos, también conocido como epithalon.',
    'Su interés está en los telómeros, estructuras que protegen los extremos de los cromosomas. Las aplicaciones relacionadas con el envejecimiento celular son experimentales.',
    ['Estructura de cuatro aminoácidos, también llamada tetrapéptido.', 'Interés biológico en el mantenimiento de los telómeros.'], 'Qué lo distingue'),
  'nad': copy(
    'La energía empieza en las células: conoce la función natural del NAD.',
    'NAD significa nicotinamida adenina dinucleótido. Es una coenzima presente de forma natural en las células.',
    'En el organismo ayuda a transformar la energía de los nutrientes y participa en procesos de mantenimiento celular.',
    ['Participa en la obtención de energía a partir de nutrientes.', 'Interviene en reacciones esenciales para el funcionamiento celular.'],
    'Funciones naturales en el organismo', 'Estas funciones describen el NAD del organismo; no equivalen a beneficios demostrados de administrar este producto.'),
  'dsip': copy(
    'Sueño y descanso: conoce el péptido DSIP y su identidad.',
    'DSIP es un péptido de nueve aminoácidos cuyo nombre hace referencia al sueño de ondas delta.',
    'Su interés está en los patrones del sueño y las señales que intervienen en el descanso. Su aplicación para mejorar el sueño es experimental.',
    ['Posible influencia en los patrones del sueño.', 'Comprensión de las señales relacionadas con el descanso.']),
  'kpv': copy(
    'Lisina, prolina y valina: tres aminoácidos que dan nombre a KPV.',
    'KPV es un péptido formado por tres aminoácidos: lisina, prolina y valina.',
    'Su potencial se relaciona con la respuesta inflamatoria de la mucosa intestinal. Es una aplicación experimental basada en resultados preclínicos.',
    ['Modulación de la respuesta inflamatoria en modelos experimentales.', 'Interés en el cuidado de la mucosa intestinal.']),
  'semax': copy(
    'Conoce Semax y su relación con las señales de las células nerviosas.',
    'Semax es un péptido sintético relacionado con un fragmento de la hormona ACTH.',
    'Su potencial está en las señales que participan en la protección y el mantenimiento de las neuronas. Las aplicaciones de esta presentación son experimentales.',
    ['Posible apoyo a mecanismos de protección neuronal.', 'Modulación de señales relacionadas con el mantenimiento de las neuronas.']),
  'selank': copy(
    'Siete aminoácidos: conoce Selank, un péptido relacionado con la tuftsina.',
    'Selank es un péptido sintético de siete aminoácidos, relacionado con el péptido natural tuftsina.',
    'Su potencial está en las señales del sistema nervioso relacionadas con la ansiedad y la respuesta al estrés. Son aplicaciones experimentales.',
    ['Posible modulación de la respuesta a la ansiedad.', 'Posible influencia en los mecanismos de adaptación al estrés.']),
  'serum-ghk-cu': copy(
    'Péptido de cobre en sérum: un formato pensado para el cuidado de tu piel.',
    'Es un producto presentado como sérum con GHK-Cu, un complejo de péptido y cobre, en formato de 30 ml.',
    'Está orientado al cuidado cosmético de la piel. Las propiedades de la fórmula dependen de su concentración y del resto de sus ingredientes.',
    ['Formato sérum para aplicación tópica.', 'Presentación de 30 ml para incorporar a una rutina cosmética según sus instrucciones.'],
    'Lo que destaca', 'Consulta la composición y el modo de uso de la fórmula antes de incorporarla a tu rutina.'),
  'selank-spray-nasal': copy(
    'Conoce Selank en su presentación de spray nasal de 10 mg.',
    'Es una presentación nasal del péptido Selank, formado por una cadena de siete aminoácidos.',
    'El interés del ingrediente está en la respuesta del sistema nervioso al estrés y la ansiedad. Las aplicaciones de este formato son experimentales.',
    ['Posible modulación de señales relacionadas con la ansiedad.', 'Posible influencia en la respuesta al estrés.'],
    'Beneficios potenciales del ingrediente', 'Los 10 mg indican contenido total, no cantidad por pulverización.'),
  'semax-spray': copy(
    'Una presentación diferente: Semax en formato spray de 10 mg.',
    'Es una presentación en spray del péptido Semax, relacionado con un fragmento de la hormona ACTH.',
    'El interés del ingrediente está en las señales de protección y mantenimiento de las neuronas. Las aplicaciones de esta formulación son experimentales.',
    ['Posible apoyo a mecanismos de protección neuronal.', 'Interés en señales de mantenimiento de las neuronas.'],
    'Beneficios potenciales del ingrediente', 'Consulta la vía de uso y el contenido por pulverización de esta formulación.'),
  'klow': copy(
    'Conoce KLOW: presentación de 80 mg y atención personalizada de Doctor Pep.',
    'KLOW es el nombre comercial de una referencia del catálogo presentada en 80 mg.',
    'Sus aplicaciones dependen de los ingredientes y sus proporciones. Doctor Pep puede ayudarte a consultar la composición de esta referencia.',
    [], 'Sobre sus beneficios', 'Los beneficios se detallarán cuando esté disponible la composición de la fórmula.'),
  'glow': copy(
    'Descubre la referencia GLOW de 70 mg dentro del catálogo Doctor Pep.',
    'GLOW es el nombre comercial de una referencia del catálogo presentada en 70 mg.',
    'Para conocer su finalidad es necesario identificar los ingredientes de esta fórmula. Puedes solicitar esa información a Doctor Pep.',
    [], 'Sobre sus beneficios', 'Los beneficios se detallarán cuando esté disponible la composición de la fórmula.'),
  '5-amino-1mq': copy(
    'Metabolismo celular: conoce 5-Amino-1MQ y la enzima NNMT.',
    '5-Amino-1MQ es una pequeña molécula, distinta de un péptido, con actividad inhibidora sobre la enzima NNMT.',
    'Su potencial está en los procesos metabólicos relacionados con la acumulación de grasa. Estas aplicaciones son experimentales, basadas en resultados preclínicos.',
    ['Posibles cambios en la composición corporal en modelos experimentales.', 'Modulación de procesos metabólicos relacionados con NNMT.']),
  'bac-water': copy(
    'El complemento para preparaciones compatibles, en 3, 10 y 30 ml.',
    'El agua bacteriostática es un diluyente que contiene un conservante para limitar el crecimiento de bacterias en las condiciones indicadas por el fabricante.',
    'Se utiliza para preparar medicamentos compatibles cuando así lo indica su ficha técnica y el profesional de salud.',
    ['Tres opciones de volumen en un mismo catálogo.', 'Diluyente para las preparaciones compatibles indicadas por un profesional.'],
    'Características principales', 'Es un diluyente, no un producto para inyección directa. La compatibilidad y preparación deben ser indicadas por un profesional.'),
  'jeringa-3-ml': copy(
    'Medición a mano: formato de 3 ml para el manejo de líquidos.',
    'Es una jeringa con capacidad declarada de 3 ml.',
    'Sirve para medir o administrar líquidos en procedimientos compatibles con su diseño y especificaciones.',
    ['Capacidad de 3 ml para identificar fácilmente el formato.', 'Manejo manual del émbolo para desplazar el líquido.'],
    'Características principales', 'Consulta el tipo de conexión y si la presentación incluye aguja.'),
  'jeringuilla-100-und': copy(
    'Completa tu selección con la jeringuilla adecuada para tu procedimiento.',
    'Es una jeringuilla identificada en el catálogo con la referencia «100 und.».',
    'Se utiliza para medir o administrar líquidos de acuerdo con su capacidad y tipo de escala.',
    ['Formato de jeringuilla para manejo de líquidos.', 'Selección según la capacidad y escala que necesites.'],
    'Características principales', 'Consulta si «100 und.» corresponde al paquete o a la escala de la referencia.'),
  'alcohol-pre-pad': copy(
    'Preparación de la piel en un práctico formato de toallita con alcohol.',
    'Es una toallita de preparación impregnada con alcohol.',
    'Se utiliza en la limpieza y preparación de la piel según las instrucciones del producto.',
    ['Formato de toallita para aplicación localizada.', 'Práctica para tareas de preparación de la piel.'],
    'Características principales', 'Consulta la concentración de alcohol y las unidades incluidas.'),
  'pen-peptide': copy(
    'Formato tipo pluma: una forma compacta de reunir los componentes de tu sistema.',
    'Es un dispositivo con formato de pluma, diseñado para trabajar con un sistema compatible de cartucho y aguja.',
    'Sirve como soporte y mecanismo de administración dentro del sistema para el que fue diseñado.',
    ['Formato de pluma para una sujeción cómoda.', 'Integra los componentes de un sistema de administración compatible.'],
    'Características principales', 'El modelo determina los cartuchos y agujas que puede utilizar.'),
  'cartucho': copy(
    'El recambio que completa tu dispositivo: consulta el cartucho compatible.',
    'Es un cartucho que funciona como depósito dentro de un dispositivo de administración compatible.',
    'Sirve para alojar el contenido que utiliza ese sistema, según las especificaciones del fabricante.',
    ['Formato de recambio para el sistema correspondiente.', 'Depósito integrado en un dispositivo compatible.'],
    'Características principales', 'Consulta capacidad y modelo de dispositivo compatible.'),
  'aguja-pen': copy(
    'Completa tu pen con una aguja de la medida y conexión adecuadas.',
    'Es una aguja destinada a conectarse a una pluma de administración compatible.',
    'Permite completar el sistema de administración del pen, con las medidas y conexión indicadas para cada modelo.',
    ['Diseño de conexión para sistemas tipo pen.', 'Selección según longitud, calibre y compatibilidad.'],
    'Características principales', 'Consulta las medidas y el modelo antes de elegir.'),
  'derma-roller': copy(
    'Cuidado de la piel en formato rodillo: conoce sus medidas y aplicaciones.',
    'Es un dispositivo manual con un rodillo de pequeñas agujas, utilizado en procedimientos de microagujas.',
    'Se emplea en tratamientos de la piel cuya finalidad y profundidad dependen de la longitud de las agujas y de la valoración profesional.',
    ['Formato de rodillo para trabajar sobre la superficie de la piel.', 'Distintas aplicaciones según la medida y el procedimiento indicado.'],
    'Características principales', 'La elección y el uso deben adaptarse al tipo de piel, con higiene e indicación profesional.'),
};
