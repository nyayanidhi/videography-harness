import sys, os
import numpy as np
from scipy import signal
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from analyze import decode, SR
ff=sys.argv[1]
maj=np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88])
mnr=np.array([6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
names=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B']
for p in sys.argv[2:]:
    x=decode(ff,p).mean(axis=1)[:int(70*SR)]
    x=signal.resample_poly(x,1,4); sr=SR/4
    f,t,Z=signal.stft(x,sr,nperseg=8192,noverlap=6144)
    M=np.abs(Z)
    m=(f>80)&(f<2000)
    pc=np.round(12*np.log2(f[m]/440)+9)%12
    chroma=np.zeros(12)
    E=M[m].sum(axis=1)
    for k in range(12): chroma[k]=E[pc==k].sum()
    best=[]
    for i in range(12):
        best.append((np.corrcoef(np.roll(maj,i),chroma)[0,1],names[i]+' major'))
        best.append((np.corrcoef(np.roll(mnr,i),chroma)[0,1],names[i]+' minor'))
    best.sort(reverse=True)
    # brightness: spectral centroid of whole
    cen=(f[:,None]*M).sum(0)/(M.sum(0)+1e-9)
    print(os.path.basename(p)[:24].ljust(24),[(round(a,2),b) for a,b in best[:3]],'centroid(<6k sr) %.0f Hz'%np.median(cen))
