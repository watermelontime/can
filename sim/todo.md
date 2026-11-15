- Error Detection: Node1 1Mbit/s, Node2 1,5Mbit/s => Node2 detects error at strange place
   => check and correct which errors shall be detected

- TDC + SSP => add feature

x "Example configuration" area has to be restructured visualy
  * Hide/Show button
  * Inside similar to "Configuration View": Dropdownd field + Load button
  * In a box like "Calculation for Node 2" the description of the configuration selected in drop down menu is shown.
  * Each example has its own descriptions, that is defined in EXAMPLE_CONFIGS
  * descriptions allow enumartion an line breaks

/ Exampel configuration: add small SJW example => many syncs to sync on Arb winner.

x Compare tcable max in Excel and Website => should be the same

x beautify "Setup"
x Node 2 default df -0.2%
x add "delay transmission" to load config dropdown
x add "show sic time to" to load config dropdown
x Show Phase Error (PE) as own band for each node  

x link for 1,5 Mbit/s worst case => sync many times to remove round trip delay = max sync effort hier => bereits im Beispiel jetzt
http://localhost:8000/can/sim/#cfg=%7B%22nodes%22%3A%5B%7B%22clkMHz%22%3A160%2C%22df%22%3A0.2%2C%22tms%22%3Atrue%2C%22tdc%22%3Afalse%2C%22transceiverType%22%3A%22TSICXL%22%2C%22txStartDelay%22%3A0%2C%22bt%22%3A%7B%22arb%22%3A%7B%22brp%22%3A1%2C%22prop%22%3A82%2C%22ps1%22%3A12%2C%22ps2%22%3A12%2C%22sjw%22%3A12%7D%2C%22data%22%3A%7B%22brp%22%3A1%2C%22prop%22%3A0%2C%22ps1%22%3A4%2C%22ps2%22%3A3%2C%22sjw%22%3A3%7D%7D%2C%22channel%22%3A%7B%22t_cc_tc_tx%22%3A15%2C%22t_cc_tc_rx%22%3A20%7D%2C%22transceiver%22%3A%7B%22t_tc_tx%22%3A80%2C%22t_tc_rx%22%3A110%2C%22a_sic_tx%22%3A10%2C%22a_sic_rx%22%3A15%2C%22a_fast_tx%22%3A5%2C%22a_fast_rx%22%3A5%2C%22tselect_threshold%22%3A600%2C%22t_pas_rec_start%22%3A530%2C%22sic2fast%22%3A205%2C%22fast2sic%22%3A245%7D%2C%22frame%22%3A%7B%22id%22%3A1399%2C%22rrs%22%3A0%2C%22sec%22%3A0%2C%22sdt%22%3A136%2C%22vcid%22%3A51%2C%22af%22%3A19088743%2C%22dlc%22%3A0%2C%22data%22%3A%5B34%5D%2C%22pcrc%22%3A341%2C%22fcrc%22%3A1431655765%7D%7D%2C%7B%22clkMHz%22%3A160%2C%22df%22%3A-0.2%2C%22tms%22%3Atrue%2C%22tdc%22%3Afalse%2C%22transceiverType%22%3A%22TSICXL%22%2C%22txStartDelay%22%3A400%2C%22bt%22%3A%7B%22arb%22%3A%7B%22brp%22%3A1%2C%22prop%22%3A82%2C%22ps1%22%3A12%2C%22ps2%22%3A12%2C%22sjw%22%3A12%7D%2C%22data%22%3A%7B%22brp%22%3A1%2C%22prop%22%3A0%2C%22ps1%22%3A4%2C%22ps2%22%3A3%2C%22sjw%22%3A3%7D%7D%2C%22channel%22%3A%7B%22t_cc_tc_tx%22%3A15%2C%22t_cc_tc_rx%22%3A20%7D%2C%22transceiver%22%3A%7B%22t_tc_tx%22%3A80%2C%22t_tc_rx%22%3A110%2C%22a_sic_tx%22%3A10%2C%22a_sic_rx%22%3A15%2C%22a_fast_tx%22%3A5%2C%22a_fast_rx%22%3A5%2C%22tselect_threshold%22%3A600%2C%22t_pas_rec_start%22%3A530%2C%22sic2fast%22%3A205%2C%22fast2sic%22%3A245%7D%2C%22frame%22%3A%7B%22id%22%3A1375%2C%22rrs%22%3A0%2C%22sec%22%3A0%2C%22sdt%22%3A136%2C%22vcid%22%3A51%2C%22af%22%3A19088743%2C%22dlc%22%3A0%2C%22data%22%3A%5B34%5D%2C%22pcrc%22%3A341%2C%22fcrc%22%3A1431655765%7D%7D%5D%2C%22bus%22%3A%7B%22t_cable%22%3A20%7D%2C%22pins%22%3A%5B11851.120314575895%5D%7D


- 1.5 Mbit/s, ideal system, only tcable exists
http://localhost:8000/can/sim/#cfg=%7B%22nodes%22%3A%5B%7B%22clkMHz%22%3A160%2C%22df%22%3A0%2C%22tms%22%3Atrue%2C%22tdc%22%3Afalse%2C%22transceiverType%22%3A%22TSICXL%22%2C%22txStartDelay%22%3A400%2C%22bt%22%3A%7B%22arb%22%3A%7B%22brp%22%3A1%2C%22prop%22%3A82%2C%22ps1%22%3A12%2C%22ps2%22%3A12%2C%22sjw%22%3A12%7D%2C%22data%22%3A%7B%22brp%22%3A1%2C%22prop%22%3A0%2C%22ps1%22%3A4%2C%22ps2%22%3A3%2C%22sjw%22%3A3%7D%7D%2C%22channel%22%3A%7B%22t_cc_tc_tx%22%3A0%2C%22t_cc_tc_rx%22%3A0%7D%2C%22transceiver%22%3A%7B%22t_tc_tx%22%3A0%2C%22t_tc_rx%22%3A0%2C%22a_sic_tx%22%3A0%2C%22a_sic_rx%22%3A0%2C%22a_fast_tx%22%3A0%2C%22a_fast_rx%22%3A0%2C%22tselect_threshold%22%3A600%2C%22t_pas_rec_start%22%3A530%2C%22sic2fast%22%3A205%2C%22fast2sic%22%3A245%7D%2C%22frame%22%3A%7B%22id%22%3A1365%2C%22rrs%22%3A0%2C%22sec%22%3A0%2C%22sdt%22%3A136%2C%22vcid%22%3A51%2C%22af%22%3A19088743%2C%22dlc%22%3A0%2C%22data%22%3A%5B34%5D%2C%22pcrc%22%3A341%2C%22fcrc%22%3A1431655765%7D%7D%2C%7B%22clkMHz%22%3A160%2C%22df%22%3A0%2C%22tms%22%3Atrue%2C%22tdc%22%3Afalse%2C%22transceiverType%22%3A%22TSICXL%22%2C%22txStartDelay%22%3A0%2C%22bt%22%3A%7B%22arb%22%3A%7B%22brp%22%3A1%2C%22prop%22%3A82%2C%22ps1%22%3A12%2C%22ps2%22%3A12%2C%22sjw%22%3A12%7D%2C%22data%22%3A%7B%22brp%22%3A1%2C%22prop%22%3A0%2C%22ps1%22%3A4%2C%22ps2%22%3A3%2C%22sjw%22%3A3%7D%7D%2C%22channel%22%3A%7B%22t_cc_tc_tx%22%3A0%2C%22t_cc_tc_rx%22%3A0%7D%2C%22transceiver%22%3A%7B%22t_tc_tx%22%3A0%2C%22t_tc_rx%22%3A0%2C%22a_sic_tx%22%3A0%2C%22a_sic_rx%22%3A0%2C%22a_fast_tx%22%3A0%2C%22a_fast_rx%22%3A0%2C%22tselect_threshold%22%3A600%2C%22t_pas_rec_start%22%3A530%2C%22sic2fast%22%3A205%2C%22fast2sic%22%3A245%7D%2C%22frame%22%3A%7B%22id%22%3A1365%2C%22rrs%22%3A1%2C%22sec%22%3A0%2C%22sdt%22%3A136%2C%22vcid%22%3A51%2C%22af%22%3A19088743%2C%22dlc%22%3A0%2C%22data%22%3A%5B34%5D%2C%22pcrc%22%3A341%2C%22fcrc%22%3A1431655765%7D%7D%5D%2C%22bus%22%3A%7B%22t_cable%22%3A256.3%7D%2C%22pins%22%3A%5B667.9329089820375%2C924.774212762712%2C1180.8238923549632%2C1187.1568858623484%2C8538.196875%5D%7D