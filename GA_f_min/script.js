
var chrt;
var chrt2;

const N = 33;
const Nt = 2;
const pm = 0.25;
const pc = 0.6;
const maxt = 100;
const maxtnc = 25;
const h = Math.pow(10, -5);
const p = 0.2;
// const minLT = 1;
// const maxLT = 10;

const xs = [
    [-2, 2],
    [-3, 3]
];

const m = xs.map(y => Math.round(Math.log2((y[1] - y[0]) / h)));
const n = m.reduce((prev, current) => prev + current, 0);
const f = (x1, x2) => Math.abs(Math.sin(Math.abs(x1)) + Math.abs(x2)-1) + Math.abs(Math.pow(x1,2)+Math.pow(x2,2)-1)

function GetStartPopulation(minLT, maxLT) {
    const n = m.reduce((first, second) => first + second, 0);
    const population = Array.from({length: N}, _ =>
        Array.from({length: n}, _ => Math.round(Math.random()))
    );
    const evalPrime = population.map(el => -fitness(el));
    const evalPrimeMin = Math.min(...evalPrime);
    const evalPrime2 = evalPrime.map(el => el - evalPrimeMin + 1);
    const avgEvalT = evalPrime2.reduce((a, b) => a + b, 0) / evalPrime2.length;
    const eta = (maxLT - minLT)/2;
    const lifeDuration = [];
    for (let i = 0; i < N; ++i) {
        lifeDuration.push(Math.min(minLT+eta*((evalPrime2[i])/(avgEvalT)),maxLT));
    }

    return [population, Array(N).fill(1), lifeDuration];
}

const fromBits = currentIndyvid => Array.from({ length: xs.length },
    (xi, index) =>
        xs[index][0] + Array.apply(null, Array(m[index])).reduce((prev, current, currentIndex) => {
            const sumInMBefore = m.reduce((pr, curr, currIdx) => {
                if (currIdx < index) {
                    return pr + curr;
                }
                return pr;
            }, 0);
            const currentBitInVector = currentIndyvid[sumInMBefore + currentIndex];
            const k = (xs[index][1] - xs[index][0]) / (Math.pow(2, m[index] - 1));
            return prev + Math.pow(2, currentIndex) * currentBitInVector * k;
        }, 0)
);

const fitness = currentIndyvid => f(...fromBits(currentIndyvid));

function MakeTournir(population, populationAge) {
   const tournamentItems = Array.from({length: Nt}, _ => {
    return Math.round(Math.random() * (population.length - 1));
    });
    const tempEls = [];
    const tempElsAge = [];
    for (let i = 0; i < population.length; ++i) {
        if (tournamentItems.includes(i)) {
            tempEls.push(population[i]);
            tempElsAge.push(populationAge[i]);
        }
    }
    let minEl = tempEls[0];
    let minElAge = tempElsAge[0];
    for (let i = 0; i < tempEls.length; ++i) {
        if (fitness(tempEls[i]) < fitness(minEl)) {
            minEl = tempEls[i];
            minElAge = tempElsAge[i];
        }
    }
    return [minEl, minElAge];
}

function MakeCrossover([item1, item2], [item1Age, item2Age]) {
    if (Math.random() < pc) {
        let r1 = Math.round(Math.random()*(n-1));
        let r2 = Math.round(Math.random()*(n-1));
        if (r2 < r1) {
            [r1, r2] = [r2, r1];
        }
        return [[
            [...item1.slice(0, r1), ...item2.slice(r1,r2), ...item1.slice(r2)],
            [...item2.slice(0, r1), ...item1.slice(r1,r2), ...item2.slice(r2)]
        ], [1, 1]];
    }
    return [[item1, item2], [item1Age, item2Age]];
}

function MakeMutation(item, itemAge) {
    if (Math.random() < pm) {
        const r = Math.round(Math.random() * (n - 1));
        item[r] = item[r] ^ 1;
        return [item, 1];
    }
    return [item, itemAge];
}

function newPopulation(population, populationAge, populationLifeDuration, minLT, maxLT) {
    const newPopulation = [];
    const newPopulationAge = [];
    const newPopultionLifeDuration = []
    for (let i = 0; i < population.length; ++i) {
        if (populationAge[i] <= populationLifeDuration[i]) {
            newPopulation.push(population[i]);
            newPopulationAge.push(populationAge[i] + 1);
            newPopultionLifeDuration.push(populationLifeDuration[i]);
        }
    }
    const newN = Math.round(p * population.length);
    for (let i = 0; i < newN; ++i) {
        let elements = [];
        let elementsAge = [];
        let [tempElements, tempElementsAge] = MakeTournir(population, populationAge);
        elements.push(tempElements);
        elementsAge.push(tempElementsAge);
        [tempElements, tempElementsAge] = MakeTournir(population, populationAge);
        elements.push(tempElements);
        elementsAge.push(tempElementsAge);
        const tempEls = [];
        const tempElsAge = [];
        for (let j = 0; j < elements.length; ++j) {
            const [tempEl, tempElAge] = MakeMutation(elements[j], elementsAge[j]);
            tempEls.push(tempEl);
            tempElsAge.push(tempElAge);
        }
        elements = tempEls;
        elementsAge = tempElsAge;
        [elements, elementsAge] = MakeCrossover(elements, elementsAge);
        newPopulation.push(elements[0]);
        newPopulationAge.push(elementsAge[0]);
        if (newPopulation.length < N) {
            newPopulation.push(elements[1]);
            newPopulationAge.push(elementsAge[1]);
        }
    }

    const evalPrime = population.map(el => -fitness(el));
    const evalPrimeMin = Math.min(...evalPrime);
    const evalPrime2 = evalPrime.map(el => el - evalPrimeMin + 1);
    const avgEvalT = evalPrime2.reduce((a, b) => a + b, 0) / evalPrime2.length;
    const eta = (maxLT - minLT)/2;
    for (let i = newPopulation.length - newN; i < newPopulation.length; ++i) {
        newPopultionLifeDuration.push(Math.min(minLT+eta*((evalPrime2[i])/(avgEvalT)),maxLT));
    }

    return [newPopulation, newPopulationAge, newPopultionLifeDuration];
}

function CheckImpove(generationsEval) {
    const listToCompare = generationsEval.slice(-maxtnc).map(el => fitness(el));
    if (listToCompare.length < maxtnc) {
        return true;
    }
    return listToCompare.some(el => el < listToCompare[0]);
}

function main() {
    let iterations = [];
    let maxLTs = [];
    let bests = [];
    for (let maxLT = 10; maxLT <= 20; maxLT+=2) {
        let [population, populationAge, lifeDuration] = GetStartPopulation(1, maxLT);
        console.log('population', 'maxLT', maxLT, population, populationAge);

        let populationEval = population.reduce((p, v) => {
            return fitness(p) < fitness(v) ? p : v;
        });
        const populationsBest = [populationEval];

        let iteration = 0;

        while (iteration++ <= maxt && CheckImpove(populationsBest)) {
            // console.log('Iteration', iteration);
            [population, populationAge, lifeDuration] = newPopulation(population, populationAge, lifeDuration, 1, maxLT);
            let populationEval = population.reduce((p, v) => fitness(p) < fitness(v) ? p : v);
            populationsBest.push(populationEval);
        }
        iterations.push(iteration);
        maxLTs.push(maxLT);

        const resInBits = populationsBest.reduce((p, v) =>fitness(p) < fitness(v) ? p : v);
        const res = fromBits(resInBits);
        bests.push(f(...res));
        let resNumOfPopulation;
        populationsBest.forEach((x, index) => {
            if (JSON.stringify(x) === JSON.stringify(resInBits)) {
                resNumOfPopulation = index;
                return true;
            }
            return false;
        });
        console.log('x:', res, ', f(x):', f(...res), ', population', resNumOfPopulation);
    }
    chrt?.destroy();
    chrt = new Chart(
        document.getElementById('chrt'),
        {
            type: 'line',
            data: {
                labels: maxLTs,
                datasets: [{
                    label: 'Iteration from maxLT',
                    backgroundColor: 'rgb(255, 255, 255)',
                    borderColor: 'rgb(0, 0, 0)',
                    data: iterations
                }]
            },
            options: {}
        }
    );
    console.log('---------------------------------------------------------------------------------------------------');

    let iterations2 = [];
    let minLTs = [];
    let bests2 = [];
    for (let minLT = 1; minLT <= 7; minLT+=1) {
        let [population, populationAge, lifeDuration] = GetStartPopulation(minLT, 15);
        console.log('population', 'minLT', minLT, population, populationAge);

        let populationEval = population.reduce((p, v) => {
            return fitness(p) < fitness(v) ? p : v;
        });
        const populationsBest = [populationEval];

        let iteration = 0;

        while (iteration++ <= maxt && CheckImpove(populationsBest)) {
            // console.log('Iteration', iteration);
            [population, populationAge, lifeDuration] = newPopulation(population, populationAge, lifeDuration, minLT, 15);
            let populationEval = population.reduce((p, v) => fitness(p) < fitness(v) ? p : v);
            populationsBest.push(populationEval);
        }
        iterations2.push(iteration);
        minLTs.push(minLT);

        const resInBits = populationsBest.reduce((p, v) =>fitness(p) < fitness(v) ? p : v);
        const res = fromBits(resInBits);
        bests2.push(f(...res));
        let resNumOfPopulation;
        populationsBest.forEach((x, index) => {
            if (JSON.stringify(x) === JSON.stringify(resInBits)) {
                resNumOfPopulation = index;
                return true;
            }
            return false;
        });
        console.log('x:', res, ', f(x):', f(...res), ', population', resNumOfPopulation);
    }
    chrt2?.destroy();
    chrt2 = new Chart(
        document.getElementById('chrt2'),
        {
            type: 'line',
            data: {
                labels: minLTs,
                datasets: [{
                    label: 'Iteration from minLT',
                    backgroundColor: 'rgb(255, 255, 255)',
                    borderColor: 'rgb(0, 0, 0)',
                    data: iterations2
                }]
            },
            options: {}
        }
    );
}

main();
