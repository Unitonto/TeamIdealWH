function processFile() {
  const fileInput = document.getElementById('fileInput');
  const target = parseInt(document.getElementById('targetInput').value);
  const output = document.getElementById('console');

  if (!fileInput.files.length) {
    output.textContent = "⚠️ Por favor, subí un archivo Excel.";
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, {type: 'array'});
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    // Agrupar productividad promedio por PICKERO
    const pickerMap = {};
    json.forEach(row => {
      const picker = row["PICKERO"];
      const bultos = parseFloat(row["#BULTOS_POR_HORA"]);
      if (!pickerMap[picker]) pickerMap[picker] = [];
      pickerMap[picker].push(bultos);
    });

    const workers = Object.entries(pickerMap).map(([name, values]) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return { name, avg };
    });

    // Lógica para buscar un equipo random
    let foundTeam = null;
    for (let i = 0; i < 10000; i++) {
      const subsetSize = Math.floor(Math.random() * Math.min(14, workers.length)) + 1;
      const team = [];
      const copy = [...workers];
      for (let j = 0; j < subsetSize; j++) {
        const idx = Math.floor(Math.random() * copy.length);
        team.push(copy.splice(idx, 1)[0]);
      }
      const total = team.reduce((sum, w) => sum + w.avg, 0);
      if (total >= target && total < target + 200) {
        foundTeam = { team, total };
        break;
      }
    }

    if (foundTeam) {
      output.textContent = "🎯 ¡Equipo encontrado!\n\n";
      foundTeam.team.forEach(p =>
        output.textContent += `👷 ${p.name}: ${p.avg.toFixed(2)} bultos/hora\n`);
      output.textContent += `\n📦 Total: ${foundTeam.total.toFixed(2)} bultos/hora`;
    } else {
      output.textContent = "❌ No se encontró una combinación válida que cumpla el target.";
    }
  };

  reader.readAsArrayBuffer(fileInput.files[0]);
}
function calculateTotalBultos() {
    if (!workbookData) return;
    const sheetName = workbookData.SheetNames[0];
    const worksheet = workbookData.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    let totalBultos = 0;
    jsonData.forEach(row => {
        totalBultos += parseFloat(row['#BULTOS_POR_HORA']) || 0;
    });

    const promedioBultosPorPickero = 150; // Puedes ajustar este promedio si querés
    const cantidadPickeros = Math.ceil(totalBultos / promedioBultosPorPickero);

    logConsole(
        `📦 Total de bultos en el día: ${totalBultos.toFixed(2)}\n` +
        `👷‍♂️ Pickers necesarios: ${cantidadPickeros} personas`
    );
}
