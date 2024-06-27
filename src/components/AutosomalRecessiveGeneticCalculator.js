import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#4ade80', '#fbbf24', '#f87171'];

const getFraction = (decimal) => {
  if (decimal === 0) return '0';
  if (decimal === 1) return '1';
  const tolerance = 1.0E-6;
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = decimal;
  do {
    let a = Math.floor(b);
    let aux = h1; h1 = a * h1 + h2; h2 = aux;
    aux = k1; k1 = a * k1 + k2; k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);
  return `${h1}/${k1}`;
};

const parseFraction = (fraction) => {
  const [numerator, denominator] = fraction.split('/').map(Number);
  return numerator / denominator;
};

const AutosomalRecessiveGeneticCalculator = () => {
  const [inputType, setInputType] = useState('percentage');
  const [parent1CarrierProbability, setParent1CarrierProbability] = useState(25);
  const [parent2CarrierProbability, setParent2CarrierProbability] = useState(25);
  const [parent1CarrierFraction, setParent1CarrierFraction] = useState('1/4');
  const [parent2CarrierFraction, setParent2CarrierFraction] = useState('1/4');
  const [outcomes, setOutcomes] = useState({ normal: 0, carrier: 0, affected: 0 });

  useEffect(() => {
    calculateOutcomes();
  }, [parent1CarrierProbability, parent2CarrierProbability, parent1CarrierFraction, parent2CarrierFraction, inputType]);

  const calculateOutcomes = () => {
    const p1 = inputType === 'percentage' ? parent1CarrierProbability / 100 : parseFraction(parent1CarrierFraction);
    const p2 = inputType === 'percentage' ? parent2CarrierProbability / 100 : parseFraction(parent2CarrierFraction);
    const q1 = 1 - p1;
    const q2 = 1 - p2;

    const probabilityBothCarriers = p1 * p2;
    const probabilityOnlyParent1Carrier = p1 * q2;
    const probabilityOnlyParent2Carrier = q1 * p2;
    const probabilityNoCarriers = q1 * q2;

    const affectedProbability = probabilityBothCarriers * 0.25;
    const carrierProbability = (probabilityBothCarriers * 0.5) + (probabilityOnlyParent1Carrier * 0.5) + (probabilityOnlyParent2Carrier * 0.5);
    const normalProbability = 1 - affectedProbability - carrierProbability;

    setOutcomes({
      normal: normalProbability,
      carrier: carrierProbability,
      affected: affectedProbability,
    });
  };

  const handleInputChange = (parent, value) => {
    if (inputType === 'percentage') {
      if (parent === 1) setParent1CarrierProbability(Number(value));
      else setParent2CarrierProbability(Number(value));
    } else {
      if (parent === 1) setParent1CarrierFraction(value);
      else setParent2CarrierFraction(value);
    }
  };

  const data = [
    { name: 'Normal', value: outcomes.normal },
    { name: 'Carrier', value: outcomes.carrier },
    { name: 'Affected', value: outcomes.affected },
  ];

  return (
    <div className="p-4 bg-blue-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Autosomal Recessive Genetic Calculator (Different Parent Probabilities)</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Input Type:</label>
        <select 
          value={inputType} 
          onChange={(e) => setInputType(e.target.value)}
          className="mb-2 p-2 rounded"
        >
          <option value="percentage">Percentage</option>
          <option value="fraction">Fraction</option>
        </select>
        
        {inputType === 'percentage' ? (
          <div>
            <label className="block mb-2">Parent 1 Carrier Probability: {parent1CarrierProbability}% (p1 = {getFraction(parent1CarrierProbability/100)})</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={parent1CarrierProbability} 
              onChange={(e) => handleInputChange(1, e.target.value)}
              className="w-full mb-2"
            />
            <label className="block mb-2">Parent 2 Carrier Probability: {parent2CarrierProbability}% (p2 = {getFraction(parent2CarrierProbability/100)})</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={parent2CarrierProbability} 
              onChange={(e) => handleInputChange(2, e.target.value)}
              className="w-full"
            />
          </div>
        ) : (
          <div>
            <label className="block mb-2">Parent 1 Carrier Fraction: (p1 = {parent1CarrierFraction})</label>
            <input 
              type="text" 
              value={parent1CarrierFraction} 
              onChange={(e) => handleInputChange(1, e.target.value)}
              className="w-full p-2 rounded mb-2"
              placeholder="Enter fraction (e.g., 1/4)"
            />
            <label className="block mb-2">Parent 2 Carrier Fraction: (p2 = {parent2CarrierFraction})</label>
            <input 
              type="text" 
              value={parent2CarrierFraction} 
              onChange={(e) => handleInputChange(2, e.target.value)}
              className="w-full p-2 rounded"
              placeholder="Enter fraction (e.g., 1/4)"
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-bold">Outcomes:</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name}: ${(value * 100).toFixed(2)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <p>Normal: {(outcomes.normal * 100).toFixed(2)}% = {getFraction(outcomes.normal)}</p>
        <p>Carrier: {(outcomes.carrier * 100).toFixed(2)}% = {getFraction(outcomes.carrier)}</p>
        <p>Affected: {(outcomes.affected * 100).toFixed(2)}% = {getFraction(outcomes.affected)}</p>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="font-bold mb-2">Calculations and Equations (Autosomal Recessive):</h3>
        <p>p1 = probability of parent 1 being a carrier = {inputType === 'percentage' ? getFraction(parent1CarrierProbability/100) : parent1CarrierFraction}</p>
        <p>p2 = probability of parent 2 being a carrier = {inputType === 'percentage' ? getFraction(parent2CarrierProbability/100) : parent2CarrierFraction}</p>
        <p>q1 = 1 - p1 = {getFraction(1 - (inputType === 'percentage' ? parent1CarrierProbability/100 : parseFraction(parent1CarrierFraction)))}</p>
        <p>q2 = 1 - p2 = {getFraction(1 - (inputType === 'percentage' ? parent2CarrierProbability/100 : parseFraction(parent2CarrierFraction)))}</p>
        <p>1. Probability of both parents being carriers: p1 × p2 = {getFraction(outcomes.affected * 4)}</p>
        <p>2. Probability of only parent 1 being a carrier: p1 × q2 = {getFraction((inputType === 'percentage' ? parent1CarrierProbability/100 : parseFraction(parent1CarrierFraction)) * (1 - (inputType === 'percentage' ? parent2CarrierProbability/100 : parseFraction(parent2CarrierFraction))))}</p>
        <p>3. Probability of only parent 2 being a carrier: q1 × p2 = {getFraction((1 - (inputType === 'percentage' ? parent1CarrierProbability/100 : parseFraction(parent1CarrierFraction))) * (inputType === 'percentage' ? parent2CarrierProbability/100 : parseFraction(parent2CarrierFraction)))}</p>
        <p>4. Probability of no parents being carriers: q1 × q2 = {getFraction(outcomes.normal)}</p>
        <p>5. Probability of affected child: (p1 × p2) × 1/4 = {getFraction(outcomes.affected)}</p>
        <p>6. Probability of carrier child: (p1 × p2 × 1/2) + (p1 × q2 × 1/2) + (q1 × p2 × 1/2) = {getFraction(outcomes.carrier)}</p>
        <p>7. Probability of normal child: 1 - (affected + carrier) = {getFraction(outcomes.normal)}</p>
      </div>
    </div>
  );
};

export default AutosomalRecessiveGeneticCalculator;