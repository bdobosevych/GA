import numpy as np
import matplotlib.pyplot as plt

N = 1000


def f(x, y):
    return np.abs(np.sin(np.abs(x))+np.abs(y)-1)+np.abs(np.power(x,2) +np.power(y,2)-1)


x = np.linspace(-2, 2, N)
y = np.linspace(-3, 3, N)
X, Y = np.meshgrid(x, y)
Z = f(X, Y)


fig = plt.figure()
ax = plt.axes(projection='3d')
ax.set_xlabel('x1')
ax.set_ylabel('x2')
ax.set_zlabel('f')
ax.plot_surface(X, Y, Z,alpha=0.4)

res_x1, res_y1, res_z1 = [0.9826812744140625, -0.169189453125 , 0.006889808679784393]

ax.scatter(res_x1, res_y1, res_y1, color='red')

res_x2, res_y2, res_z2 = [0.9850921630859375, -0.16724395751953125 , 0.00218988687681687]

ax.scatter(res_x2, res_y2, res_y2, color='green')


plt.show()

