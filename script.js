
var chrt;

const N = 33;
const Nt = 2;
const pm = 0.25;
const pc = 0.6;
const maxt = 1500;
const maxtnc = 25;
const h = Math.pow(10, -5);

const xs = [
    [-2, 2],
    [-3, 3]
];

const m = xs.map(y => Math.round(Math.log2((y[1] - y[0]) / h)));
const n = m.reduce((prev, current) => prev + current, 0);
const f = (x1, x2) => Math.abs(Math.sin(Math.abs(x1)) + Math.abs(x2)-1) + Math.abs(Math.pow(x1,2)+Math.pow(x2,2)-1)

function GetStartPopulation() {
    const n = m.reduce((first, second) => first + second, 0);
    return Array.from({ length: N }, _ =>
        Array.from({ length: n }, _ => Math.round(Math.random()))
    );
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

function MakeTournir(population) {
    const tournamentItems = Array.from({ length: Nt }, _ => {
        return Math.round(Math.random() * (population.length - 1));
    });
    return population.filter((v, i) => tournamentItems.includes(i)).reduce((p, v) => {
        return fitness(p) < fitness(v) ? p : v;
    });
}

function MakeCrossover(item1, item2) {
    if (Math.random() < pc) {
        const r = Math.round(Math.random() * (n - 1));
        return [
            [...item1.slice(0, r), ...item2.slice(r)],
            [...item2.slice(0, r), ...item1.slice(r)]
        ];
    }
    return [item1, item2];
}

function MakeMutation(item) {
    if (Math.random() < pm) {
        const r = Math.round(Math.random() * (n - 1));
        item[r] = item[r] ^ 1;
    }
    return item;
}

function newPopulation(population) {
    const newpop = [];
    while (newpop.length < N) {
        let elements = [MakeTournir(population), MakeTournir(population)];
        elements = elements.map(el => MakeMutation(el));
        elements = MakeCrossover(...elements);
        newpop.push(elements[0]);
        if (newpop.length < N) {
            newpop.push(elements[1]);
        }
    }
    return newpop;
}

function CheckImpove(generationsEval) {
    const listToCompare = generationsEval.slice(-maxtnc).map(el => fitness(el));
    if (listToCompare.length < maxtnc) {
        return true;
    }
    return listToCompare.some(el => el < listToCompare[0]);
}

function plotEval(populationsBest) {
    chrt?.destroy();
    chrt = new Chart(
        document.getElementById('chrt'),
        {
            type: 'line',
            data: {
                labels: Array.from({ length: populationsBest.length }, (v, i) => `${i}`),
                datasets: [{
                    label: 'Оцінка',
                    backgroundColor: 'rgb(255, 255, 255)',
                    borderColor: 'rgb(0, 0, 0)',
                    data: populationsBest.map(el => fitness(el))
                }]
            },
            options: {}
        }
    );
}

function main() {
    let population = GetStartPopulation();

    let populationEval = population.reduce((p, v) => {
        return fitness(p) < fitness(v) ? p : v;
    });
    const populationsBest = [populationEval];

    let iteration = 0;

    while (iteration++ <= maxt && CheckImpove(populationsBest)) {
        population = newPopulation(population);
        let populationEval = population.reduce((p, v) => fitness(p) < fitness(v) ? p : v);
        populationsBest.push(populationEval);
    }
    const resInBits = populationsBest.reduce((p, v) =>fitness(p) < fitness(v) ? p : v);
    const res = fromBits(resInBits);
    let resNumOfPopulation;
    populationsBest.forEach((x, index) => {
        if (JSON.stringify(x) === JSON.stringify(resInBits)) {
            resNumOfPopulation = index;
            return true;
        }
        return false;
    });
    console.log('x:', res, ', f(x):', f(...res), ', population', resNumOfPopulation);
    plotEval(populationsBest);
}

main();
