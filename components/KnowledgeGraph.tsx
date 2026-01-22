
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphLink } from '../types';

const KnowledgeGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 400;

    const nodes: GraphNode[] = [
      { id: "Graphs", group: 0, label: "Graph Ecosystem" },
      { id: "Wikidata", group: 1, label: "Wikidata" },
      { id: "Spanner", group: 2, label: "Spanner Graph" },
      { id: "RDF", group: 1, label: "RDF Data Model" },
      { id: "Property", group: 2, label: "Property Graph" },
      { id: "SPARQL", group: 1, label: "SPARQL" },
      { id: "GQL", group: 2, label: "GQL (ISO Standard)" },
      { id: "Collaborative", group: 1, label: "Collaborative/Public" },
      { id: "Distributed", group: 2, label: "Enterprise Distributed" },
    ];

    const links: GraphLink[] = [
      { source: "Graphs", target: "Wikidata", value: 1 },
      { source: "Graphs", target: "Spanner", value: 1 },
      { source: "Wikidata", target: "RDF", value: 1 },
      { source: "Wikidata", target: "SPARQL", value: 1 },
      { source: "Wikidata", target: "Collaborative", value: 1 },
      { source: "Spanner", target: "Property", value: 1 },
      { source: "Spanner", target: "GQL", value: 1 },
      { source: "Spanner", target: "Distributed", value: 1 },
    ];

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create a container group for all graph elements to support zoom/pan
    const container = svg.append("g");

    // Initialize zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5]) // Set min and max zoom levels
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = container.append("g")
      .attr("stroke", "#cbd5e1") // Light link color
      .attr("stroke-opacity", 0.8)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value) * 2);

    const node = container.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", 8)
      .attr("fill", d => d.group === 1 ? "#3b82f6" : d.group === 2 ? "#10b981" : "#f59e0b")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(d => d.label)
      .attr("fill", "#64748b") // Darker text for light theme
      .style("font-weight", "500")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }, []);

  return (
    <div className="w-full h-[400px] glass-panel rounded-2xl overflow-hidden mt-8 relative shadow-sm cursor-grab active:cursor-grabbing">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Concept Relationship Map (Scroll to Zoom, Drag to Pan)</h3>
      </div>
      <svg ref={svgRef} className="w-full h-full" viewBox={`0 0 800 400`} preserveAspectRatio="xMidYMid meet"></svg>
    </div>
  );
};

export default KnowledgeGraph;
