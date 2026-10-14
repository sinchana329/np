/**
 * @file samplePcaps.ts
 * @brief Preloaded Sample PCAP Datasets
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

export interface SamplePcapDataset {
  id: string;
  title: string;
  description: string;
  filename: string;
  badge: string;
}

export const SAMPLE_PCAP_DATASETS: SamplePcapDataset[] = [
  {
    id: 'web_http_handshake',
    title: '1. Web HTTPS Handshake & Data Transfer',
    description: 'Clean capture containing TCP 3-way handshake (SYN -> SYN-ACK -> ACK) and TLS records.',
    filename: 'web_https_handshake.pcap',
    badge: '3-Way Handshake',
  },
  {
    id: 'tcp_retransmit_loss',
    title: '2. TCP Retransmissions & Packet Loss',
    description: 'Capture showing packet loss heuristic detection and TCP Fast Retransmit packets.',
    filename: 'tcp_retransmit_loss.pcap',
    badge: 'Retransmissions',
  },
  {
    id: 'dns_udp_traffic',
    title: '3. Mixed TCP & UDP Traffic Stream',
    description: 'Real-world capture mix of HTTP/TCP streams and DNS/UDP protocol queries.',
    filename: 'mixed_tcp_udp.pcap',
    badge: 'TCP + UDP',
  },
];
